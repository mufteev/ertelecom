const clean = require('gulp-clean');
const replace = require('gulp-replace');
const { parallel, src, dest } = require('gulp');

const static_dir = './client/build/static/**/'

function deleteLicense() {
  return src(static_dir + '*.LICENSE.txt')
    .pipe(clean());
}

function deleteMapFiles() {
  return src(static_dir + '*.{js,css}.map')
    .pipe(clean());
}

function cleanMapInFiles() {
  return src(static_dir + '*.{js,css}')
    .pipe(replace(/^.*sourceMappingURL.*$/igm, ''))
    .pipe(dest('./client/build/static'));
}

exports.cleanMap = parallel(
  deleteLicense,
  deleteMapFiles,
  cleanMapInFiles,
);

