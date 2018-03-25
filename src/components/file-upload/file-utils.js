import wordIcon from './images/word.jpeg';
import excelIcon from './images/excel.jpeg';
import pptIcon from './images/ppt.jpeg';
import pdfIcon from './images/pdf.jpg';
import fileIcon from './images/file.jpg';
import zipIcon from './images/zip.jpeg';
import txtIcon from './images/txt.jpeg';
import urlParse from 'url-parse';

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

const fileExtIcons = {
    'docx': wordIcon,
    'xlsx': excelIcon,
    'xls': excelIcon,
    'pdf': pdfIcon,
    'doc': wordIcon,
    'pptx': pptIcon,
    'ppt': pptIcon,
    'zip': zipIcon,
    '7z': zipIcon,
    'txt': txtIcon,
    'rar': zipIcon
}

function isImage(url) {
    const ext = getFileExt(url);
    const imageExts = ['png', 'jpg', 'bmp', 'jpeg', 'gif'];
    return (imageExts.filter(item => { return item == ext }) || []).length > 0;
}

function getFileIconByFileType(type) {
    if (!type.startsWith('image')) {
        if (!fileTypeIcons[type]) {
            return fileIcon;
        }
        return fileTypeIcons[type];
    }
}

function getFileExt(url) {
    const fileName = getFileNameByUrl(url);
    const fileNameComponents = (fileName || '').split('.') || [];
    const ext = fileNameComponents[fileNameComponents.length - 1];
    return ext;
}

function getFileIconByUrl(url) {
    const ext = getFileExt(url);
    if (!fileExtIcons[ext]) {
        return fileIcon;
    }
    return fileExtIcons[ext];
}

function getFileNameByUrl(url) {
    const urlComponents = urlParse(url);
    const pathnameComponents = (urlComponents.pathname || '').split('/') || [];
    return pathnameComponents[pathnameComponents.length - 1];
}

const utils = {
    getFileIconByFileType,
    getFileIconByUrl,
    getFileNameByUrl,
    isImage
}

export default utils;