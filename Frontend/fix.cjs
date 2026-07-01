const fs = require('fs');
const path = require('path');

const walk = dir => fs.readdirSync(dir).reduce((acc, file) => {
  const p = path.join(dir, file);
  return acc.concat(fs.statSync(p).isDirectory() ? walk(p) : p);
}, []);

walk('./src').filter(f => f.endsWith('.jsx') || f.endsWith('.js')).forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/import React(?:, \{([^}]+)\})? from 'react';\n/g, (match, group) => {
    return group ? `import {${group}} from 'react';\n` : '';
  });
  
  // Custom manual replacements for specific file unused vars
  if(f.includes('JobDetail.jsx')) c = c.replace(/const \{ id \} = useParams\(\);\n/, '');
  if(f.includes('LoginRegister.jsx')) {
    c = c.replace(/import { Button } from '\.\.\/components\/ui\/Button';\n/, '');
    c = c.replace(/import { useState } from 'react';\n/, '');
  }
  if(f.includes('Scheduling.jsx')) c = c.replace(/const upcomingBookings = \[\s*\{[^\}]+\}\s*\];\n/, '');
  if(f.includes('MyApplications.jsx')) c = c.replace(/import { Button } from '\.\.\/\.\.\/components\/ui\/Button';\n/, '');
  if(f.includes('api.js')) c = c.replace(/import axios from 'react-axios';\s*\/\/[^\n]+\n/, '');
  if(f.includes('authService.js')) c = c.replace(/import { api } from '\.\/api';\n/, '');
  
  fs.writeFileSync(f, c);
});
