# Licensed under the Apache License. See footer for details.

require "cakex"

pkg = require "./package.json"

preReqFile = "../ragents-test/tmp/pre-reqs-updated.txt"

#-------------------------------------------------------------------------------
task "watch", "watch for source file changes, build", -> taskWatch()
task "build", "run a build",                          -> taskBuild()

WatchSpec = "*.ts lib/**/* lib/channels/**/* www/**/*"

#-------------------------------------------------------------------------------
mkdir "-p", "tmp"

#-------------------------------------------------------------------------------
taskBuild = ->
  copyBowerFiles "doc/bower"

  syntaxCheckTypeScript "ragents-def.ts"
  syntaxCheckTypeScript "lib/channels/channel-def.ts"

  log "linting ..."
  jshint "lib/*.js lib/channels/*.js"

  buildBrowserVersion()
  "".to preReqFile

#-------------------------------------------------------------------------------
taskWatch = ->
  watchIter()

  watch
    files: WatchSpec.split " "
    run:   watchIter

  # watch
  #   files: "doc/**/*"
  #   run:   watchIterDoc

  watch
    files: "Cakefile"
    run: (file) ->
      return unless file == "Cakefile"
      log "Cakefile changed, exiting"
      exit 0

#-------------------------------------------------------------------------------
watchIter = ->
  log "in #{path.relative "../..", __dirname}"

  taskBuild()

#-------------------------------------------------------------------------------
watchIterDoc = ->
  log "in #{path.relative "../..", __dirname}"

  createGraphvizSVG "doc/graphviz"

#-------------------------------------------------------------------------------
syntaxCheckTypeScript = (file) ->
  log "syntax checking: #{file} ..."
  tsc "--outDir tmp --module commonjs #{file}"

#-------------------------------------------------------------------------------
buildBrowserVersion = ->
  oBase  = "ragents-browser.js"

  mkdir "-p", "www"

  # run browserify
  opts = """
    --outfile    tmp/#{oBase}
    --standalone ragents
    --entry      lib/ragents.js
    --plugin     [ minifyify --map #{oBase}.map.json --output tmp/#{oBase}.map.json ]
    --debug
  """

  opts = opts.trim().split(/\s+/).join(" ")

  log "running browserify ..."
  browserify opts

  # run cat-source-map
  log "running cat-source-map ..."
  cat_source_map "--fixFileNames tmp/#{oBase} www/#{oBase}"

  log "browser file(s) generated at: www/#{oBase}"

#-------------------------------------------------------------------------------
createGraphvizSVG = (iDir) ->
  log "generating SVG from GraphViz ..."

  oDir = path.join iDir, "..", "svg"

  for file in ls iDir
    continue unless file.match /\.dot$/

    iFile = path.join iDir, file
    oFile = path.join oDir, file

    oFile += ".svg"

    cmd = "dot -Tsvg -o #{oFile} #{iFile}"
    log "  #{cmd}"

    exec cmd

  return

#-------------------------------------------------------------------------------
copyBowerFiles = (dir) ->
  bowerConfig = require "./bower-config"

  log "installing files from bower"

  cleanDir dir

  for name, {version, files} of bowerConfig
    unless test "-d", "bower_components/#{name}"
      bower "install #{name}##{version}"
      log ""

  for name, {version, files} of bowerConfig
    for src, dst of files
      src = "bower_components/#{name}/#{src}"

      if dst is "."
        dst = "#{dir}/#{name}"
      else
        dst = "#{dir}/#{name}/#{dst}"

      mkdir "-p", dst

      cp "-R", src, dst

#-------------------------------------------------------------------------------
cleanDir = (dir) ->
  mkdir "-p", dir
  rm "-rf", "#{dir}/*"

#-------------------------------------------------------------------------------
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#-------------------------------------------------------------------------------
