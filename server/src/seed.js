import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import {connectDB} from './config/db.js';
import {User,Workspace,Project,Task} from './models/index.js';

await connectDB();
if(!process.env.SEED_PASSWORD||process.env.SEED_PASSWORD.length<12)throw new Error('Set SEED_PASSWORD to a value of at least 12 characters before seeding.');
const email='demo@taskaura.local';let user=await User.findOne({email});
if(user){console.log('Demo user already exists; leaving data unchanged.');await mongoose.disconnect();process.exit(0);}
const workspace=await Workspace.create({name:'Demo workspace',members:[]});
user=await User.create({name:'Alex Morgan',email,password:await bcrypt.hash(process.env.SEED_PASSWORD,12),workspace:workspace._id});
workspace.members.push({user:user._id,role:'owner'});await workspace.save();
const project=await Project.create({workspace:workspace._id,name:'Website refresh',description:'A focused pass on the pages that introduce our work.',color:'#526b57',status:'Active',owner:user._id,members:[user._id],targetDate:new Date(Date.now()+14*86400000),milestones:[{name:'Page structure',completed:true},{name:'Visual review',dueDate:new Date(Date.now()+7*86400000)}]});
await Task.insertMany([
 {workspace:workspace._id,title:'Map the homepage content',description:'Agree on the story before polishing the layout.',status:'Completed',priority:'High',project:project._id,assignee:user._id,completedAt:new Date(Date.now()-86400000),tags:['content']},
 {workspace:workspace._id,title:'Review the mobile navigation',status:'In Progress',priority:'Urgent',project:project._id,assignee:user._id,dueDate:new Date(Date.now()+86400000),estimatedMinutes:45},
 {workspace:workspace._id,title:'Share the first visual direction',status:'To Do',priority:'Medium',project:project._id,assignee:user._id,dueDate:new Date(Date.now()+3*86400000),subtasks:[{title:'Collect examples'},{title:'Prepare two options'}]},
 {workspace:workspace._id,title:'Gather launch notes',status:'Backlog',priority:'Low',assignee:user._id}
]);
console.log(`Seeded ${email} in workspace ${workspace._id}.`);
await mongoose.disconnect();
