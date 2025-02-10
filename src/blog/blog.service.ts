import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './model/blog.entity';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  async findAllBlogs(): Promise<Blog[]> {
    return this.blogRepository.find();
  }

  async findBlog(id: string): Promise<Blog | null> {
    return await this.blogRepository.findOne({ where: { id } });
  }
}
