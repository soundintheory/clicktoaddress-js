'use strict';
module.exports = function(grunt) {
	grunt.initConfig({
		less: {
			dist: {
				files: {
					'build/cc_c2a.min.css': [
						'less/**/*.less'
					]
				},
				options: {
					compress: true
				}
			}
		},
		uglify: {
			dist: {
				files: {
					'build/cc_c2a.min.js': [
						'js/*.js'
					]
				},
				options: {
					report: false,
					mangle: true,
					compress: true,
					beautify: true,
					preserveComments: 'some'
				}
			}
		},
		clean: {
			dist: [
				'build/cc_c2a.min.css',
				'build/cc_c2a.min.js'
			]
		}
	});

	// Load tasks
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-less');

	// Register tasks
	grunt.registerTask('default', [
		'clean',
		'less',
		'uglify'
	]);
};
