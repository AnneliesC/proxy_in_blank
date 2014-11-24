var gulp = require("gulp");
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var package_json = require('./package.json');

var config = require('./config.json');

var plugins = require("gulp-load-plugins")({
	pattern: ['gulp-*', 'gulp.*'],
	replaceString: /\bgulp[\-.]/,
});

function getFilePath(target,type){
	return config[type][target].folder + "/" + config[type][target].file;
}

var scripts = ["**/*.js","!node_modules/**/*.js","!public/**/*.js"];

//alias for size(), errors on .size.
plugins.filesize = plugins.size;

gulp.task('stylesheets', function() {
	return gulp.src(getFilePath("src","stylesheets"))
							.pipe(plugins.plumber())
							.pipe(plugins.scssLint())
							.pipe(plugins.compass({
								css: config.stylesheets.dest.folder,
								sass: config.stylesheets.src.folder,
							}))
							.pipe(plugins.autoprefixer({
								browsers: ['last 2 versions','ie 9'],
								cascade: false
							}))
							.pipe(plugins.util.env.type === 'production' ? plugins.minifyCss() : plugins.util.noop())
							.pipe(plugins.filesize())
							.pipe(gulp.dest(config.stylesheets.dest.folder));
});

gulp.task("scripts", function(){
	return browserify("./" + config.scripts.src.folder + "/" + config.scripts.src.entry_file)
					.bundle()
					.on('error', function(error){
						this.emit("end");
					})
					.pipe(source(config.scripts.dest.file))
					.pipe(buffer())
					.pipe(plugins.util.env.type === 'production' ? plugins.uglify() : plugins.util.noop())
					.pipe(plugins.filesize())
					.pipe(gulp.dest(config.scripts.dest.folder));
});

gulp.task("components", function(){
	return gulp.src(config.components.src.folder + "/" + config.components.src.templates)
							.pipe(plugins.tap(function(file){
								var path = file.path.split("/");
								file.base += path[path.length-2];
							}))
							.pipe(plugins.smoosher())
							.pipe(gulp.dest(config.components.dest.folder + "/"));
});

gulp.task("hinting", function(){
	return gulp.src(scripts)
							.pipe(plugins.plumber())
							.pipe(plugins.jshintCached("./.jshintrc"))
							.pipe(plugins.jshintCached.reporter('jshint-stylish'))
							.pipe(plugins.jshintCached.reporter("fail"))
							.on('error', function(error){
								plugins.util.beep();
								this.emit("end");
							});
});

gulp.task("server",function(){
	plugins.nodemon({script: package_json.main, ignore: ["public/**","_js/**","_components/**","gulpfile.js"]});
});

gulp.task("database", function(){
	require('child_process').exec("mongod", function(err,stdout,stderr){
		console.log(stdout);
	});
});

gulp.task('watch', function() {
	gulp.watch(getFilePath("src","stylesheets"), ['stylesheets']);
	gulp.watch(getFilePath("src","scripts"), ['scripts']);
	gulp.watch(config.components.src.folder + "/" + config.components.src.all, ['components']);
	gulp.watch(scripts, ['hinting']);
});

gulp.task('default', ['watch','stylesheets','hinting','scripts','components','server','database']);
