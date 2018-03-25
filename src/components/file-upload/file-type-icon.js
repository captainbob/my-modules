import wordIcon from './images/word.jpeg';
import excelIcon from './images/excel.jpeg';
import pptIcon from './images/ppt.jpeg';
import pdfIcon from './images/pdf.jpg';
import fileIcon from './images/file.jpg';
import zipIcon from './images/zip.jpeg';
import txtIcon from './images/txt.jpeg';

const fileTypeIcons = {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': wordIcon,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': excelIcon,
    'application/pdf': pdfIcon,
    'application/msword': wordIcon,
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': pptIcon,
    'application/vnd.ms-powerpoint': pptIcon,
    'application/zip': zipIcon,
    'application/x-7z-compressed': zipIcon,
    'text/plain': txtIcon,
    'application/x-rar': zipIcon
}

export default function getFileIcon(type) {
    if (!type.startsWith('image')) {
        if (!fileTypeIcons[type]) {
            return fileIcon;
        }
        return fileTypeIcons[type];
    }
}