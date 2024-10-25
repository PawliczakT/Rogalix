import { Anthropic } from '@anthropic-ai/sdk';

export class RogalAnalyzerService {
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });
    }

    async analyzeRogalImage(imageBuffer, metadata) {
        try {
            const response = await this.anthropic.messages.create({
                model: "claude-3-sonnet-20240229",
                max_tokens: 1024,
                messages: [{
                    role: "user",
                    content: `Analyze this rogal with the following metadata:
                        Name: ${metadata.name}
                        Price: ${metadata.price}zł
                        Weight: ${metadata.weight}g
                        
                        Please provide a quality assessment and suggestions.`
                }]
            });

            return response.content;
        } catch (error) {
            console.error('Error analyzing rogal:', error);
            throw error;
        }
    }

    async analyzeTasteMatrix(tasteMatrix) {
        try {
            const response = await this.anthropic.messages.create({
                model: "claude-3-sonnet-20240229",
                max_tokens: 1024,
                messages: [{
                    role: "user",
                    content: `Analyze this taste similarity matrix and provide insights:
                        ${JSON.stringify(tasteMatrix, null, 2)}`
                }]
            });

            return response.content;
        } catch (error) {
            console.error('Error analyzing taste matrix:', error);
            throw error;
        }
    }

    async generateQualityReport(rogalData) {
        try {
            const response = await this.anthropic.messages.create({
                model: "claude-3-sonnet-20240229",
                max_tokens: 1024,
                messages: [{
                    role: "user",
                    content: `Generate a quality report for this rogal:
                        ${JSON.stringify(rogalData, null, 2)}`
                }]
            });

            return response.content;
        } catch (error) {
            console.error('Error generating report:', error);
            throw error;
        }
    }
}
