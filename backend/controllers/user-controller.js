import User from "../models/User.js";
import bcrypt from 'bcryptjs'

export const getAllUser = async(req,res,next) => {
    let users
    try {
        users = await User.find()
        res.render('admin', { users, user: req.user });
    }catch (err){
        console.log(err)
    }
    if (!users) {
        return res.status(404).json({message: "no users found"})
    }
    return res.status(200).json({users})

}

export const isAdminMiddleware = async (req, res, next) => {
    try {
        if (req.user.isAdmin) {
            return next();
        } else {
            res.redirect('/'); 
        }
    } catch (error) {
        console.error('Error in isAdminMiddleware:', error);
        res.status(500).send('Internal Server Error');
    }
}


export const getUsers = async (req, res) => {
    try {
        const users = await User.find(); 
        res.render('admin', { users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Internal Server Error');
    }
}

export const signup = async (req,res, next) => {
    const {name, email, password} = req.body
    console.log(name)
    console.log(email)
    console.log(password)
    console.log(req.body)

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    let existingUser;
    try{
        existingUser = await User.findOne({email})
    }catch (err){
       return  console.log(err)
    }
    if (existingUser){
        return res.status(400).json({message:"user already exists. Login instead"})
    }
    const hashedPassword = bcrypt.hashSync(password)
    const user = new User({
        name, 
        email,
        password: hashedPassword
    })

    try {
        await user.save()
    }catch(err){
        return console.log(err)
    }
    return res.status(201).json({user})
}


export const login = async(req, res, next) => {
    const {email, password} = req.body
    let existingUser;
    try{
        existingUser = await User.findOne({email})
    }catch (err){
       return  console.log(err)
    }
    if (!existingUser){
        return res.status(404).json({message:"user is not found by this email"})
    }

    const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password)

    if (!isPasswordCorrect){
        return res.status(400).json({message:"incorrect password"})
    }
    req.session.user = existingUser 
    return res.status(200).json({message:"login succesful"})
}