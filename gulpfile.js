let gulp = require('gulp');
let autoprefixer = require('gulp-autoprefixer');
let browserSync = require('browser-sync').create();
let changed = require('gulp-changed'); // для бинарных файлов (картинки, шрифты)
let changedInPlace = require('gulp-changed-in-place'); // для текстовых файлов (html, css, js)
let concat = require('gulp-concat');
let csso = require('gulp-csso');
let del = require('del');
let gcmq = require('gulp-group-css-media-queries');
let ghPages = require('gulp-gh-pages');
let imagemin = require('gulp-imagemin');
let imageminPngquant = require('imagemin-pngquant');
let imageminMozjpeg = require('imagemin-mozjpeg');
let htmlmin = require('gulp-htmlmin');
let notify = require('gulp-notify');
let plumber = require('gulp-plumber');
let rename = require('gulp-rename');
let sass = require('gulp-sass');
let uglify = require('gulp-uglify-es').default;

const paths = {
  build: {
    html: 'build/',
    css: 'build/css',
    js: 'build/js/',
    img: 'build/img/',
    fonts: 'build/fonts/',
  },
  src: {
    html: 'src/*.html',
    style: 'src/sass/main.scss',
    js: ['node_modules/jquery/dist/jquery.min.js', 'node_modules/swiper/swiper-bundle.min.js', 'src/js/**/*.*'],
    img: 'src/img/**/*.*',
    fonts: 'src/fonts/**/*.*',
  },
  watch: {
    html: 'src/*.html',
    style: ['src/sass/*.scss', 'src/sass/blocks/*.scss'],
    js: 'src/js/**/*.*',
    img: 'src/img/**/*.*',
    fonts: 'src/fonts/**/*.*',
  },
  clean: './build',
};

gulp.task('html', () => {
  return gulp
    .src(paths.src.html)
    .pipe(plumber({ errorHandler: notify.onError('Ошибка: <%= error.message %>') }))
    .pipe(changedInPlace({ firstPass: true }))
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: true,
      })
    )
    .pipe(gulp.dest(paths.build.html))
    .pipe(browserSync.stream());
});

gulp.task('js', () => {
  return gulp
    .src(paths.src.js)
    .pipe(uglify())
    .pipe(concat('scripts.min.js'))
    .pipe(changedInPlace({ firstPass: true }))
    .pipe(gulp.dest(paths.build.js))
    .pipe(browserSync.stream());
});

gulp.task('css', () => {
  return gulp
    .src(paths.src.style)
    .pipe(plumber({ errorHandler: notify.onError('Ошибка: <%= error.message %>') }))
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gcmq())
    .pipe(csso())
    .pipe(changedInPlace({ firstPass: true }))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest(paths.build.css))
    .pipe(browserSync.stream());
});

gulp.task('images', () => {
  return gulp.src(paths.src.img).pipe(changed(paths.build.img)).pipe(gulp.dest(paths.build.img));
});

gulp.task('images-optimize', () => {
  return gulp
    .src(paths.src.img)
    .pipe(
      imagemin([
        imagemin.optipng({ optimizationLevel: 5 }),
        imageminPngquant({ quality: [0.8, 0.8] }),
        imageminMozjpeg({ quality: 85 }),
      ])
    )
    .pipe(gulp.dest(paths.build.img));
});

gulp.task('fonts', () => {
  return gulp.src(paths.src.fonts).pipe(changed(paths.build.fonts)).pipe(gulp.dest(paths.build.fonts));
});

gulp.task('webserver', () => {
  browserSync.init({
    server: {
      baseDir: './build',
    },
    notify: false,
    ghostMode: false,
    scrollProportionally: false,
  });

  gulp.watch(paths.watch.html, gulp.series('html'));
  gulp.watch(paths.watch.style, gulp.series('css'));
  gulp.watch(paths.watch.js, gulp.series('js'));
  gulp.watch(paths.watch.img, gulp.series('images'));
  gulp.watch(paths.watch.fonts, gulp.series('fonts'));
});

gulp.task('clean', () => {
  return del(paths.clean);
});

gulp.task('build', gulp.series('html', 'js', 'css', 'fonts', 'images'));
gulp.task('_default', gulp.series('clean', 'build', 'webserver'));

gulp.task('ghPages', () => {
  return gulp.src('./build/**/*').pipe(ghPages());
});

gulp.task('cleanGhPagesCache', () => {
  return del('./.publish');
});

gulp.task('deploy', gulp.series('ghPages', 'cleanGhPagesCache'));
