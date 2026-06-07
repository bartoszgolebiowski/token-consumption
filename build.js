import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PAGES_DIR = path.join(__dirname, 'pages');
const TEMPLATE_FILE = path.join(__dirname, 'template.html');
const OUTPUT_FILE = path.join(__dirname, 'index.html');

export default function build() {
    console.log('Building presentation deck...');

    // 1. Check directories
    if (!fs.existsSync(PAGES_DIR)) {
        console.error(`Error: Pages directory "${PAGES_DIR}" does not exist.`);
        process.exit(1);
    }
    if (!fs.existsSync(TEMPLATE_FILE)) {
        console.error(`Error: Template file "${TEMPLATE_FILE}" does not exist.`);
        process.exit(1);
    }

    // 2. Read and sort page files
    const files = fs.readdirSync(PAGES_DIR)
        .filter(file => file.endsWith('.html'))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    if (files.length === 0) {
        console.warn('Warning: No HTML files found in the pages directory.');
    }

    // 3. Process each page file
    const slidesHtml = [];

    files.forEach(filename => {
        const filePath = path.join(PAGES_DIR, filename);
        const content = fs.readFileSync(filePath, 'utf8');

        // Parse metadata (transition, layout) from comments
        const metadata = {
            transition: 'slide-horizontal',
            layout: 'none'
        };

        const commentRegex = /<!--([\s\S]*?)-->/g;
        let match;
        while ((match = commentRegex.exec(content)) !== null) {
            const commentBody = match[1];
            const pairs = commentBody.split(',');
            pairs.forEach(pair => {
                const parts = pair.split(':');
                if (parts.length === 2) {
                    const key = parts[0].trim().toLowerCase();
                    const val = parts[1].trim();
                    if (key === 'transition' || key === 'layout') {
                        metadata[key] = val;
                    }
                }
            });
        }

        // Clean metadata comments from the content
        const cleaned = content.replace(/<!--(?:(?!-->).)*(?:transition|layout)(?:(?!-->).)*-->/gs, '').trim();

        // Standardize layout class names
        let layoutClass = metadata.layout.toLowerCase();
        if (layoutClass !== 'none') {
            if (!layoutClass.startsWith('slide-layout-') && !layoutClass.startsWith('layout-')) {
                layoutClass = `slide-layout-${layoutClass}`;
            }
        }

        // Generate Slide ID from filename (removing path and extension)
        const slideName = path.basename(filename, '.html');
        const slideId = `slide-${slideName}`;

        // Wrap slide content
        let slideHtml = `<!-- START SLIDE: ${filename} -->\n`;
        slideHtml += `<section class="slide" id="${slideId}" data-transition="${metadata.transition}">\n`;
        
        if (layoutClass !== 'none') {
            slideHtml += `    <div class="slide-content ${layoutClass}">\n`;
            // Indent content for readability in the final output
            const indentedContent = cleaned.split('\n').map(line => '        ' + line).join('\n');
            slideHtml += `${indentedContent}\n`;
            slideHtml += `    </div>\n`;
        } else {
            const indentedContent = cleaned.split('\n').map(line => '    ' + line).join('\n');
            slideHtml += `${indentedContent}\n`;
        }
        
        slideHtml += `</section>\n<!-- END SLIDE: ${filename} -->\n\n`;
        slidesHtml.push(slideHtml);
    });

    // 4. Read template and inject compiled slides
    let template = fs.readFileSync(TEMPLATE_FILE, 'utf8');
    const placeholder = '<!-- SLIDES_PLACEHOLDER -->';
    
    if (!template.includes(placeholder)) {
        console.error(`Error: Placeholder "${placeholder}" not found in template.html.`);
        process.exit(1);
    }

    const outputContent = template.replace(placeholder, slidesHtml.join('\n'));

    // 5. Write to output index.html
    fs.writeFileSync(OUTPUT_FILE, outputContent, 'utf8');
    console.log(`Successfully compiled presentation! Generated: ${OUTPUT_FILE}`);
}

// Support direct script execution
const isDirectRun = process.argv[1] && (
    process.argv[1] === fileURLToPath(import.meta.url) || 
    process.argv[1].endsWith('build.js')
);
if (isDirectRun) {
    build();
}
