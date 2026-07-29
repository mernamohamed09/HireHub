const Job = require("../models/jobs");
const CompanyProfile = require("../models/company");
const User = require("../models/User");

// Validation Schemas
const {
    createJobSchema,
    updateJobSchema,
    jobIdSchema,
    searchJobSchema,
} = require("./validation/jobValidation");

// دالة مساعدة لتنظيف النصوص من الرموز الخاصة ومنع هجمات ReDoS
const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const createJob = async (req, res) => {
    try {
        const { error, value } = createJobSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                msg: error.details.map((err) => err.message)
            });
        }

        // The company name is authoritative from the poster's verified profile,
        // not free text they typed: the job board must show the registered
        // company, not whatever string was submitted. Falls back to the user's
        // name if they haven't created a company profile yet.
        const companyProfile = await CompanyProfile.findOne({ user: req.user.id }).select('companyName');
        let companyName = companyProfile?.companyName;
        if (!companyName) {
            const user = await User.findById(req.user.id).select('name');
            companyName = user?.name || value.company;
        }

        const jobData = {
            ...value,
            company: companyName,
            postedBy: req.user.id
        };

        const job = await Job.create(jobData);

        res.status(201).json({
            success: true,
            message: 'Job posted successfully',
            job
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


const getAllJobs = async (req, res) => {
    try {
       
        const jobs = await Job.find({
            isActive: true,
            expiresAt: { $gt: Date.now() }
        })
        .populate('postedBy', 'name email')
        .sort({ createdAt: -1 }); 

        res.status(200).json({
            success: true,
            count: jobs.length,
            jobs
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


const getJobById = async (req, res) => {
    try {
        // verify id
        const { error } = jobIdSchema.validate({ id: req.params.id });
        if (error) {
            return res.status(400).json({ msg: 'Invalid Job ID format' });
        }

        
        const job = await Job.findById(req.params.id)
            .populate('postedBy', 'name email phone');

        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        // Anonymous callers are treated as non-owners: an inactive job is only
        // visible to its poster or an admin.
        const isOwner = req.user && job.postedBy?._id?.toString() === req.user.id;
        const isAdmin = req.user?.role === 'admin';
        if (!job.isActive && !isAdmin && !isOwner) {
            return res.status(404).json({ msg: 'Job not found or inactive' });
        }

        res.status(200).json({
            success: true,
            job
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


const updateJob = async (req, res) => {
    try {
        
        const { error: idError } = jobIdSchema.validate({ id: req.params.id });
        if (idError) {
            return res.status(400).json({ msg: 'Invalid Job ID format' });
        }

       
        const { error, value } = updateJobSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                msg: error.details.map((err) => err.message)
            });
        }

       
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

       
        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                msg: 'Unauthorized. You can only update your own jobs.'
            });
        }

        
        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            value,
            { new: true, runValidators: true }
        ).populate('postedBy', 'name email');

        res.status(200).json({
            success: true,
            message: 'Job updated successfully',
            job: updatedJob
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


const deleteJob = async (req, res) => {
    try {
        
        const { error } = jobIdSchema.validate({ id: req.params.id });
        if (error) {
            return res.status(400).json({ msg: 'Invalid Job ID format' });
        }

        
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        
        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                msg: 'Unauthorized. You can only delete your own jobs.'
            });
        }

        
        job.isActive = false;
        await job.save();

        
        res.status(200).json({
            success: true,
            message: 'Job deactivated successfully (soft delete)'
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};



const searchJobs = async (req, res) => {
    try {
        const { error: searchError, value: query } = searchJobSchema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
            convert: true
        });
        if (searchError) {
            return res.status(400).json({ msg: searchError.details.map((item) => item.message) });
        }
        const { 
            q,           // search query
            location, 
            minSalary, 
            maxSalary, 
            company,
            sort = 'latest',
            page = 1,
            limit = 10
        } = query;

        
        const filter = {
            isActive: true,
            expiresAt: { $gt: Date.now() }
        };

        // استخدام escapeRegex لتنظيف المدخلات وحماية قاعدة البيانات
        if (q) {
            const cleanQ = escapeRegex(q);
            const searchRegex = new RegExp(cleanQ, 'i');
            filter.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { company: searchRegex }
            ];
        }

        
        if (location) {
            const cleanLocation = escapeRegex(location);
            filter.location = new RegExp(cleanLocation, 'i');
        }

        
        if (minSalary || maxSalary) {
            filter.salary = {};
            if (minSalary) filter.salary.$gte = Number(minSalary);
            if (maxSalary) filter.salary.$lte = Number(maxSalary);
        }

        
        if (company) {
            const cleanCompany = escapeRegex(company);
            filter.company = new RegExp(cleanCompany, 'i');
        }


        let sortOption = { createdAt: -1 };
        switch (sort) {
            case 'latest': sortOption = { createdAt: -1 }; break;
            case 'oldest': sortOption = { createdAt: 1 }; break;
            case 'salary-high': sortOption = { salary: -1 }; break;
            case 'salary-low': sortOption = { salary: 1 }; break;
            case 'title': sortOption = { title: 1 }; break;
            default: sortOption = { createdAt: -1 };
        }

        // Pagination (تقسيم النتائج إلى صفحات)
        const skip = (Number(page) - 1) * Number(limit);
        const total = await Job.countDocuments(filter);

        const jobs = await Job.find(filter)
            .populate('postedBy', 'name email')
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit));

        res.status(200).json({
            success: true,
            results: jobs.length,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            jobs
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


module.exports = {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob,
    searchJobs
};
