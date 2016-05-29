import gulp from 'gulp';
import path from 'path';
import {config} from './gulp/gulp.config';
import del from 'del';
import eslint from 'gulp-eslint';
import $if from 'gulp-if';
import cache from 'gulp-cache';
import imagemin from 'gulp-imagemin';
import size from 'gulp-size';
import wiredep from 'wiredep';
import postcss from 'gulp-postcss';
import precss from 'precss';
import stylelint from 'stylelint';
import autoprefixer from 'autoprefixer';
import sourcemaps from 'gulp-sourcemaps';
import cssnano from 'cssnano';
import browserSync from 'browser-sync';
import * as gutil from 'gulp-util';

const reload = browserSync.reload;

// Clean temp and dist folders
const clean = () => {
  gutil.log('Cleaning workspace directory');

  return del([
    config.dist,
    config.temp
  ]);
};

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

// postcss
const processors = [
  precss(),
  stylelint(),
  autoprefixer({browsers: config.autoprefixer}),
  cssnano()
];

// Styles
const styles = () =>
  gulp.src(path.join(config.src, config.styles, 'main.css'))
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

const watch = () => {
  gutil.log('Whatching for file changes...');

  gulp.watch([
    path.join(config.src, '*.*'),
    path.join('!', config.src, '*.html')
  ]).on('change', gulp.series(copy, reload));

  gulp.watch(
    path.join(config.src, config.styles, '*.css')
  ).on('change', gulp.series(styles, reload));

  gulp.watch(
    path.join(config.src, config.scripts, '**/*.js')
  ).on('change', gulp.series(lint, reload));
};

const serve = gulp.series(
    clean,
    bowerify,
    gulp.parallel(copy, styles, images),
    gulp.parallel(startServer, watch)
  );

export {
  clean,
  lint,
  images,
  copy,
  bowerify,
  styles,
  serve
};

export default serve;

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
