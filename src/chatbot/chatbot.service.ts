import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackageService } from 'src/packages/entity/packageService.entity';
import { WeekCheckupServiceEntity } from 'src/weekCheckupService/entities/WeekCheckupService.entity';
import { ConfigService } from '@nestjs/config';
import { Packages } from 'src/packages/entity/package.entity';

@Injectable()
export class ChatbotService {
    private apiKey: string;
    private geminiApiUrl: string;

  constructor(
    private readonly configService: ConfigService, // Inject ConfigService

    @InjectRepository(Packages)
    private packageRepository: Repository<Packages>,
    @InjectRepository(WeekCheckupServiceEntity) // Sử dụng WeekCheckupServiceEntity
    private weekCheckupServiceRepository: Repository<WeekCheckupServiceEntity>,
  ) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || ''; // Cung cấp chuỗi rỗng làm mặc định
    this.geminiApiUrl = this.configService.get<string>('GEMINI_API_URL') || ''; // Cung cấp chuỗi rỗng làm mặc định
  }

  async getChatResponse(message: string) {
    try {
        const response = await axios.post(
            `${this.geminiApiUrl}?key=${this.apiKey}`,
            {
              contents: [
                {
                  parts: [
                    {
                      text: message,
                    },
                  ],
                },
              ],
              generationConfig: {
                maxOutputTokens: 200,
                temperature: 0.8,
                topP: 0.9,
              },
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          );
      
          const aiReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (aiReply && aiReply.toLowerCase().includes('gói dịch vụ')) {
        return this.getPackageInfo();
      }

    //   if (aiReply && aiReply.toLowerCase().includes('lịch khám')) {
    //     return this.getCheckupScheduleRecommendation(message); // Gọi hàm khuyến nghị
    //   }

      return aiReply;
    } catch (error: any) {
        console.error('Error calling Gemini API:', error);
        if (error.response) {
          console.error('Gemini API Response Data:', error.response.data);
        }
        return 'Tôi xin lỗi, có lỗi xảy ra khi kết nối với dịch vụ AI.';
      }
  }

  async getPackageInfo() {
    try {
      const packages = await this.packageRepository.find({
        where: { isDeleted: false },
        relations: ['packageServices', 'packageServices.service'],
      });

      if (packages && packages.length > 0) {
        return packages.map(pkg => ({
          name: pkg.name,
          description: pkg.description,
          packageUrl: `https://nestcare.site/services/${pkg.id}`, // Tạo URL dựa trên ID, điều chỉnh theo routing thực tế của bạn
        }));
      } else {
        return []; // Trả về mảng rỗng nếu không có gói dịch vụ
      }
    } catch (error) {
      console.error('Error fetching package info:', error);
      return []; // Trả về mảng rỗng trong trường hợp lỗi
    }
  }



//   private async getCheckupScheduleRecommendation(userMessage: string): Promise<string> {
//     try {
//       const weekMatch = userMessage.match(/tuần\s*(\d+)/i);
//       let weekNumber: number | null = null;
//       if (weekMatch && weekMatch[1]) {
//         weekNumber = parseInt(weekMatch[1], 10);
//       }

//       if (weekNumber) {
//         const recommendedCheckups = await this.weekCheckupServiceRepository.find({
//           where: { week: weekNumber },
//           relations: ['services'], // Load mối quan hệ 'services'
//         });

//         if (recommendedCheckups && recommendedCheckups.length > 0) {
//           const checkupList = recommendedCheckups.map((checkupService) =>
//             checkupService.services.map((service) => `- ${service.name}`).join('\n')
//           ).join('\n');

//           if (checkupList) {
//             return `Dựa trên tuần thai thứ ${weekNumber}, chúng tôi khuyến nghị các dịch vụ sau:\n${checkupList}`;
//           } else {
//             return `Không có dịch vụ cụ thể nào được liên kết với tuần thai thứ ${weekNumber}.`;
//           }
//         } else {
//           return `Không tìm thấy lịch khám cụ thể cho tuần thai thứ ${weekNumber}. Vui lòng liên hệ để được tư vấn chi tiết.`;
//         }
//       } else {
//         return 'Vui lòng cho biết bạn đang ở tuần thai thứ mấy để tôi có thể đưa ra khuyến nghị lịch khám phù hợp.';
//       }
//     } catch (error) {
//       console.error('Error fetching checkup schedule:', error);
//       return 'Không thể lấy thông tin về lịch khám vào lúc này.';
//     }
//   }
}