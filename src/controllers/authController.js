const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const generateToken = (id, email) => {

    const jwtSecret = "asd93d939dm3d";

    return jwt.sign({id, email}, jwtSecret, {expiresIn: "1d"});
};

const serializeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
})

const register = async (req, res) => {

    try{
        console.log(req.body);

        const {name, email, password} = req.body;
        console.log(name, email, password);

        if(!name || !email || !password){
            return res.status(400).json({
                message: "Name, Email and Password are required!"
            });
        }

        const existingUser = await User.findOne({
            email: String(email).toLowerCase()
        });

        if(existingUser){
            return res.status(409).json({
                message: "Email is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        console.log(user);

        return res.status(201).json({
            message: "User registered successfully.",
            data: {
                user:{
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            message: "Error while registering user."
        });
    }
    
}

const login = async (req, res) => {
    try{
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                message: "Email and Password are required!"
            });
        }

        const user = await User.findOne({
            email: String(email).toLowerCase()
        });

        if(!user){
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if(!isValidPassword){
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        
        const token = generateToken(String(user._id), email);

        return res.json({
            message: "Login successful",
            data:{
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            message: "Error while registering user."
        });
    }
    
}

const getMe = async (req, res) => {

    try{
        if(!req.user || !req.user.id){
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const user = await User.findById(req.user.id).select("-password");

        if(!user){
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.json({
            message: "Authenticated used fecthed successfully",
            data: {
                user
            }
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            message: "Error while fetching authenticated user."
        });
    }
}

const listUsers = async (req, res) => {
    try{
        if(!req.user || !req.user.id){
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const users = await User.find({_id: { $ne: req.user.id }})
        .select("-password")
        .sort({ name: 1 });

        return res.status(200).json({
            message: "Users fetched successfully.",
            data: {
                users: users.map(serializeUser)
            }
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            message: "Error while fetching users."
        });
    }
}

module.exports = { register, login, getMe, listUsers };