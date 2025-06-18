import { PrismaClient } from '../generated/prisma';
import { Request, Response } from 'express'

const prisma = new PrismaClient();

// export async function createUser (req, res) {

// }

export async function getAllUsers (req: Request, res: Response) {
    try{
        const all = await prisma.user.findMany();
        res.json(all);
    } catch (e) {
        console.error(e)
        res.status(500).json({error: 'Could not fetch users'})
    }
}

export async function getUserById (req: Request, res: Response) {
    const {userID} = req.params;
    const id = Number(userID);
    if (isNaN(id)){
        return res.status(400).json({error: 'Invalid user ID'})
    }
    const user = await prisma.user.findUnique({where: {id}});
    if (!user) {
        return res.status(404).json({error: 'User not found'})
    }
    
    return res.json(user)
}

// async function updateUser (req, res) {

// }

// async function deleteUser (req, res) {

// }

// async function loginUser (req, res) {

// }

