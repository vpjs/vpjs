/* global module: true */
module.exports = function (grunt) {
    'use strict';
    //init
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['docs'],
        jsdoc : {
            dist : {
                src: ['src/**/*.js', 'README.md'],
                options: {
                    destination: 'docs/',
                    recurse: true
                }
            }
        },
        //grunt watch
        watch: {
            docs: {
                files: ['src/**/*.js'],
                tasks: ['docs']
            }
        }
    });
    //load deps
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    //task
    grunt.registerTask('docs', ['clean', 'jsdoc']);
};