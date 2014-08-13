var gulp = require('gulp');
var clean = require('gulp-clean');
var replace = require('gulp-replace');
var watch = require('gulp-watch');
var connect = require('gulp-connect');
var uglify = require('gulp-uglifyjs');
var rename = require('gulp-rename');
var preprocess = require('gulp-preprocess');
var path = require('path');

var argv = require('minimist')(process.argv.slice(2));

var SRC_DIR = 'src';
var INTERMEDIATE_DIR = 'intermediate';
var BUILD_DIR = 'build';

console.log(argv);

var DEBUG = (argv.debug == true);
var BUILD_WEBGL = (argv.all == true || argv.webgl == true);

gulp.task('watch', function()
{
	watch({ glob: [SRC_DIR + '/**/*.{js,frag,vert}'] }, function()
	{
		gulp.start('build');
	});

	watch({ glob: ['examples/**/*.{js,html}'] }, function()
	{
		gulp.src('examples/**/*.{js,html}')
		.pipe(connect.reload());
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
		.pipe(replace(/\/\/(.+?)(\r\n|\n|\r)/g, '')) // Remove comments
		.pipe(replace(/\/\*([\s\S]+?)\*\//g, '')) // Remove comments
		.pipe(replace(/(\r\n|\n|\r)/g, ''))
		.pipe(replace(/\s+/g, ' '))
		.pipe(replace(/$/g, '\';'))
		.pipe(gulp.dest(INTERMEDIATE_DIR));
});

gulp.task('copy', ['shaders'], function()
{
	return gulp.src(
		[
			SRC_DIR + '/**/*.js',
			INTERMEDIATE_DIR + '/**/*.{frag,vert}'
		], { base: './' })
		.pipe(gulp.dest(BUILD_DIR))
});

gulp.task('build', ['copy'], function()
{
	var sources = [];

	sources.push(SRC_DIR + '/core/core.js',
			     SRC_DIR + '/core/Matrix.js',
			     SRC_DIR + '/core/Vector.js',
			     SRC_DIR + '/core/Rectangle.js',
			     SRC_DIR + '/display/Texture.js',
			     SRC_DIR + '/display/Drawable.js',
				 SRC_DIR + '/display/Scene.js',
				 SRC_DIR + '/display/Sprite.js',
			     SRC_DIR + '/display/Renderer.js');

	if (BUILD_WEBGL)
	{
		sources.push(INTERMEDIATE_DIR + '/**/*.{frag,vert}',
			         SRC_DIR + '/display/webgl/TextureCache.js',
			         SRC_DIR + '/display/webgl/WebGlRenderer.js');
	}

	return gulp.src(sources)
		.pipe(preprocess({ context: { DEBUG: DEBUG } }))
		.pipe(uglify('owesome.min.js', { outSourceMap: true }))
		.pipe(gulp.dest(BUILD_DIR))
		.pipe(connect.reload());
});

gulp.task('connect', function()
{
	connect.server(
	{
		root: [path.resolve('./examples'), path.resolve('./build')],
		livereload: true
	})
});

gulp.task('default', ['connect', 'watch']);