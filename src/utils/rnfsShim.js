// Shim for react-native-fs in Expo Go
export const DocumentDirectoryPath = '';
export const ExternalDirectoryPath = '';
export const ExternalStorageDirectoryPath = '';
export const TemporaryDirectoryPath = '';
export const LibraryDirectoryPath = '';
export const PicturesDirectoryPath = '';

export default {
    DocumentDirectoryPath,
    ExternalDirectoryPath,
    ExternalStorageDirectoryPath,
    TemporaryDirectoryPath,
    LibraryDirectoryPath,
    PicturesDirectoryPath,
    mkdir: () => Promise.resolve(),
    moveFile: () => Promise.resolve(),
    copyFile: () => Promise.resolve(),
    unlink: () => Promise.resolve(),
    exists: () => Promise.resolve(true),
    readFile: () => Promise.resolve(''),
    writeFile: () => Promise.resolve(),
};
