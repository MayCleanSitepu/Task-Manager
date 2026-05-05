import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()

export class ProjectsRepository {
    constructor (private prisma: PrismaService) {}

    async create(data: any) {
        return this.prisma.project.create({data});
    }

    async findAll(search?: string, skip = 0, take = 10, userId?: string){
        return this.prisma.project.findMany({
            where: {
                status: 'ACTIVE',
                ...(search ? { name: { contains: search, mode: 'insensitive'}} : {}),
                ...(userId ? { ownerId: userId } : {})
            },
            include: {
                _count: {select:{tasks: true}},
                owner: { select: { name: true } }
            },
            skip,
            take,
            orderBy: { createdAt: 'desc' }
        });
    }

    async findById(id: string){
        return this.prisma.project.findUnique({
            where: {id},
            include: { tasks: true, owner:{select: {name:true, email:true}}}
        })
    }

    async update(id: string, data:any) {
        return this.prisma.project.update({
            where: {id},
            data,
        })
    }

    async delete(id: string){
        return this.prisma.project.update({
            where:{id},
            data: {status:'ARCHIVED'}
        })
    }

}