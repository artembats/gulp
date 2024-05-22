const gulp = require('gulp');

	// HTML
const fileInclude = require('gulp-file-include');
const htmlclean = require('gulp-htmlclean');
const typograf = require('gulp-typograf');

	// SASS
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');

const server = require('gulp-server-livereload');
const clean = require('gulp-clean');
const fs = require('fs');
// const sourceMaps = require('gulp-sourcemaps');
const groupMedia = require('gulp-group-css-media-queries');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const changed = require('gulp-changed');

	// SVG
const svgsprite = require('gulp-svg-sprite');


// clean
gulp.task('clean:docs', function (done) {
	if (fs.existsSync('./docs/')) {
		return gulp
			.src('./docs/', { read: false })
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
gulp.task('html:docs', function () {
	return (
		gulp
			.src([
				'./src/html/**/*.html',
				'!./**/blocks/**/*.*',
				'!./src/html/docs/**/*.*',
			])
			.pipe(changed('./docs/'))
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
			.pipe(htmlclean())
			.pipe(gulp.dest('./docs/'))
	);
});


// SASS
gulp.task('sass:docs', function () {
	return (
		gulp
			.src('./src/scss/*.scss')
			.pipe(changed('./docs/css/'))
			.pipe(plumber(plumberNotify('SCSS')))
			// .pipe(sourceMaps.init())
			.pipe(sassGlob())
			.pipe(sass())
			.pipe(autoprefixer(['last 33 versions', '> 0.3%'], { cascade: false }))
			.pipe(groupMedia())
			.pipe(csso())
			// .pipe(sourceMaps.write())
			.pipe(gulp.dest('./docs/css/'))
	);
});


// IMG
gulp.task('images:docs', function () {
	return (
		gulp
			.src(['./src/img/**/*', '!./src/img/svg-icons/**/*'])
			.pipe(changed('./docs/img/'))
			.pipe(gulp.dest('./docs/img/'))
	);
});


// SVG
const svgStack = {
	mode: {
		stack: {
			example: true,
		},
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

gulp.task('svgStack:docs', function () {
	return gulp
		.src('./src/img/svg-icons/**/*.svg')
		.pipe(plumber(plumberNotify('SVG:dev')))
		.pipe(svgsprite(svgStack))
		.pipe(gulp.dest('./docs/img/svg-sprite/'));
});

gulp.task('svgSymbol:docs', function () {
	return gulp
		.src('./src/img/svg-icons/**/*.svg')
		.pipe(plumber(plumberNotify('SVG:dev')))
		.pipe(svgsprite(svgSymbol))
		.pipe(gulp.dest('./docs/img/svg-sprite/'));
});


// files
gulp.task('files:docs', function () {
	return gulp
		.src('./src/files/**/*')
		.pipe(changed('./docs/files/'))
		.pipe(gulp.dest('./docs/files/'));
});


// JS
gulp.task('js:docs', function () {
	return gulp
		.src('./src/js/*.js')
		.pipe(changed('./docs/js/'))
		.pipe(plumber(plumberNotify('JS')))
		.pipe(gulp.dest('./docs/js/'));
});


// server
const serverOptions = {
	livereload: true,
	open: true,
};

gulp.task('server:docs', function () {
	return gulp.src('./docs/').pipe(server(serverOptions));
});
