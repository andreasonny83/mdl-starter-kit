import gulp from 'gulp';
import path from 'path';
import {config} from './gulp/gulp.config';
import eslint from 'gulp-eslint';
import $if from 'gulp-if';
import cache from 'gulp-cache';
import imagemin from 'gulp-imagemin';
import size from 'gulp-size';
import wiredep from 'wiredep';
import postcss from 'gulp-postcss';
import sass from 'gulp-sass';
import autoprefixer from 'autoprefixer';
import sourcemaps from 'gulp-sourcemaps';
import cssnano from 'cssnano';
import browserSync from 'browser-sync';

// import {clean, bowerify} from './gulp/utils';
// import {styles, stylesDev} from './gulp/styles';
// import scripts from './gulp/scripts';
// import copy from './gulp/copy';
// import * as gutil from 'gulp-util';
//
// const reload = browserSync.reload;

// Lint JavaScript
const lint = () =>
  gulp.src(path.join(config.src, config.scripts))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe($if(!browserSync.active, eslint.failOnError()));

// Optimize images
const images = () =>
  gulp.src(path.join(config.src, config.images, '**/*'))
    .pipe(cache(imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(path.join(config.dist, config.images)))
    .pipe(size({title: 'images'}));

// Copy all files at the root level (app)
const copy = () =>
  gulp.src([
    path.join(config.src, '*.*'),
    path.join('!', config.src, '*.html'),
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest(config.dist))
    .pipe(size({title: 'copy'}));

// Inject Bower packages
const bowerify = () =>
  gulp.src(path.join(config.src, 'index.html'))
    .pipe(wiredep.stream())
    .pipe(gulp.dest(config.temp));

// Styles
const processors = [
  autoprefixer({browsers: config.autoprefixer}),
  cssnano()
];

const styles = () =>
  gulp.src(path.join(config.src, config.styles, '*.scss'))
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.init())
    .pipe(postcss(processors))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(path.join(config.temp, config.styles)));

const startServer = () =>
  browserSync.init({
    server: {
      baseDir: [
        config.temp,
        config.src
      ],
      routes: {
        '/bower_components': './bower_components'
      }
    }
  });

const serve = gulp.series(bowerify,
    gulp.parallel(copy, styles, images),
    startServer);

// const setProd = cb => {
//   env.env = 'PROD';
//
//   gutil.log(
//       'Compiling APP in',
//       gutil.colors.magenta(env.env),
//       'mode'
//     );
//
//   return cb();
// };
//
// const watch = () => {
//   gutil.log('Whatching for file changes...');
//
//   gulp.watch(config.files).on('change', gulp.series(copy, reload));
//   gulp.watch(config.styles.src).on('change', gulp.series(styles, reload));
//   gulp.watch(config.scripts.src).on('change', gulp.series(scripts, reload));
// };
//
//
// const compile = gulp.series(
//     clean,
//     bowerify,
//     gulp.parallel(
//       stylesDev,
//       scripts
//     ),
//     copy
//   );
//
// const build = gulp.series(setProd, compile);
// const serve = gulp.series(compile, gulp.parallel(startServer, watch));
//
export {
  lint,
  images,
  copy,
  bowerify,
  styles,
  serve
};
// clean,
// build,
// serve,
// watch

// export default build;
