var gulp = require('gulp');
var clean = require('gulp-clean');
var replace = require('gulp-replace');
var concat = require('gulp-concat');
var watch = require('gulp-watch');
var connect = require('gulp-connect');
var path = require('path');

var SRC_DIR = 'src';
var INTERMEDIATE_DIR = 'intermediate';
var BUILD_DIR = 'build';

gulp.task('watch', function()
{
	watch({ glob: [SRC_DIR + '/**/*.{js,frag,vert}'] }, function()
	{
		gulp.start('concat');
	});
});

gulp.task('clean', function()
{
	return gulp.src([BUILD_DIR, INTERMEDIATE_DIR])
		.pipe(clean());
});

gulp.task('shaders', ['clean'], function()
{
	return gulp.src([SRC_DIR + '/**/*.{frag,vert}'])
		.pipe(replace(/^\/\/ (.+?)(\r\n|\n|\r)/g, '$1 = \''))
		.pipe(replace(/(\r\n|\n|\r)/g, ''))
		.pipe(replace(/\s+/g, ' '))
		.pipe(replace(/$/g, '\';'))
		.pipe(gulp.dest(INTERMEDIATE_DIR));
});

gulp.task('concat', ['shaders'], function()
{
	return gulp.src(
		[
			SRC_DIR + '/core.js',
			INTERMEDIATE_DIR + '/**/*.{frag,vert}',
			SRC_DIR + '/test.js'
		])
		.pipe(concat('main.js', 
		{
			sourceRoot: '../'
		}))
		.pipe(gulp.dest(BUILD_DIR))
		.pipe(connect.reload());
});

gulp.task('connect', function()
{
	connect.server(
	{
		root: [path.resolve('./')],
		livereload: true
	})
});

gulp.task('default', ['connect', 'watch']);