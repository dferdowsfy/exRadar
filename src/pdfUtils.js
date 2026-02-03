// PDF Text Extraction utility using pdf.js
import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractTextFromPDF(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        return fullText.trim();
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error('Failed to extract text from PDF');
    }
}

export async function extractTextFromFile(file) {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.pdf')) {
        return await extractTextFromPDF(file);
    } else if (fileName.endsWith('.txt') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
        // For .txt files, just read as text
        // Note: .doc/.docx would need additional parsing, but we'll try text for now
        const text = await file.text();
        // Check if it looks like binary data
        if (text.startsWith('%PDF') || text.includes('\x00')) {
            throw new Error('Binary file detected. Please upload a PDF or plain text file.');
        }
        return text;
    } else {
        // Try to read as text
        const text = await file.text();
        if (text.startsWith('%PDF') || text.includes('\x00')) {
            throw new Error('Binary file detected. Please use PDF format.');
        }
        return text;
    }
}
