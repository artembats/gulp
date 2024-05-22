const gulp = require('gulp');

const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const server = require('gulp-server-livereload');
const clean = require('gulp-clean');
const fs = require('fs');
const sourceMaps = require('gulp-sourcemaps');
const groupMedia = require('gulp-group-css-media-queries');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const changed = require('gulp-changed');
const typograf = require('gulp-typograf');
const svgsprite = require('gulp-svg-sprite');


// clean
gulp.task('clean:dev', function (done) {
	if (fs.existsSync('./build/')) {
		return gulp
			.src('./build/', { read: false })
			.pipe(clean({ force: true }));
	}
	done();
});


const fileIncludeSetting = {
	prefix: '@@',
	basepath: '@file',
};

const plumberNotify = (title) => {
	return {
		errorHandler: notify.onError({
			title: title,
			message: 'Error <%= error.message %>',
			sound: false,
		}),
	};
};


// HTML
gulp.task('html:dev', function () {
	return gulp
		.src([
			'./src/html/**/*.html',
			'!./**/blocks/**/*.*',
			'!./src/html/docs/**/*.*',
		])
		.pipe(changed('./build/', { hasChanged: changed.compareContents }))
		.pipe(plumber(plumberNotify('HTML')))
		.pipe(fileInclude(fileIncludeSetting))
		.pipe(
			typograf({
				locale: ['ru', 'en-US'],
				htmlEntity: { type: 'digit' },
				safeTags: [
					['<\\?php', '\\?>'],
					['<no-typography>', '</no-typography>'],
				],
			})
		)
		.pipe(gulp.dest('./build/'));
});


// SASS
gulp.task('sass:dev', function () {
	return gulp
		.src('./src/scss/*.scss')
		.pipe(changed('./build/css/'))
		.pipe(plumber(plumberNotify('SCSS')))
		.pipe(sourceMaps.init())
		.pipe(sassGlob())
		.pipe(sass())
		.pipe(autoprefixer(['last 33 versions', '> 0.3%'], { cascade: false }))
		.pipe(groupMedia())
		.pipe(sourceMaps.write())
		.pipe(gulp.dest('./build/css/'));
});


// IMG
gulp.task('images:dev', function () {
	return (
		gulp
			.src(['./src/img/**/*', '!./src/img/svg-icons/**/*'])
			.pipe(changed('./build/img/'))
			.pipe(gulp.dest('./build/img/'))
	);
});


// SVG
const svgStack = {
	mode: {
		stack: {
			example: true,
		},
	},
	shape: {
		transform: [
			{
				svgo: {
					js2svg: { indent: 4, pretty: true },
				},
			},
		],
	},
};

const svgSymbol = {
	mode: {
		symbol: {
			sprite: '../sprite.symbol.svg',
		},
	},
	shape: {
		transform: [
			{
				svgo: {
					js2svg: { indent: 4, pretty: true },
					plugins: [
						{
							name: 'removeAttrs',
							params: {
								attrs: '(fill|stroke)',
							},
						},
					],
				},
			},
		],
	},
};

gulp.task('svgStack:dev', function () {
	return gulp
		.src('./src/img/svg-icons/**/*.svg')
		.pipe(plumber(plumberNotify('SVG:dev')))
		.pipe(svgsprite(svgStack))
		.pipe(gulp.dest('./build/img/svg-sprite/'))
});

gulp.task('svgSymbol:dev', function () {
	return gulp
		.src('./src/img/svg-icons/**/*.svg')
		.pipe(plumber(plumberNotify('SVG:dev')))
		.pipe(svgsprite(svgSymbol))
		.pipe(gulp.dest('./build/img/svg-sprite/'));
});


// files
gulp.task('files:dev', function () {
	return gulp
		.src('./src/files/**/*')
		.pipe(changed('./build/files/'))
		.pipe(gulp.dest('./build/files/'));
});


// JS
gulp.task('js:dev', function () {
	return gulp
		.src('./src/js/*.js')
		.pipe(changed('./build/js/'))
		.pipe(plumber(plumberNotify('JS')))
		.pipe(gulp.dest('./build/js/'));
});


// server
const serverOptions = {
	livereload: true,
	open: true,
};

gulp.task('server:dev', function () {
	return gulp.src('./build/').pipe(server(serverOptions));
});

gulp.task('watch:dev', function () {
	gulp.watch('./src/scss/**/*.scss', gulp.parallel('sass:dev'));
	gulp.watch(
		['./src/html/**/*.html', './src/html/**/*.json'],
		gulp.parallel('html:dev')
	);
	gulp.watch('./src/img/**/*', gulp.parallel('images:dev'));
	gulp.watch('./src/files/**/*', gulp.parallel('files:dev'));
	gulp.watch('./src/js/**/*.js', gulp.parallel('js:dev'));
	gulp.watch(
		'./src/img/svg-icons/*',
		gulp.series('svgStack:dev', 'svgSymbol:dev')
	);
});
