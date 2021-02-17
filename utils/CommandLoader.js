const { Collection } = require("discord.js");
const { readdir, stat } = require("fs");
const path = require("path");

async function commandsloader(client) {
  const commands = new Collection();

  try {
    const commandsFiles = await getCommandFiles("./commands");
    console.log(`> Found ${commandsFiles.length} command(s)`);
    for (const file of commandsFiles) {
      const command = require(file);
      commands.set(command.name, command);
    }
  } catch (e) {
    console.error(e);
    console.log("There was an error while reading command files");
    process.exit(1);
  }

  return commands;
}

/**
 * Recursively walk a directory asynchronously and obtain all file names (with full path).
 *
 * @param dir Folder name you want to recursively process
 * @param done Callback function, returns all files with full path.
 * @param filter Optional filter to specify which files to include,
 *   e.g. for json files: (f: string) => /.json$/.test(f)
 *  @copyright https://gist.github.com/erikvullings/c7eed546a4be0ba43532f8b83048ef38
 *
 */

const walk = (dir, done, filter) => {
  let results = [];
  readdir(dir, (err, list) => {
    if (err) {
      return done(err);
    }
    let pending = list.length;
    if (!pending) {
      return done(null, results);
    }
    list.forEach((file) => {
      file = path.resolve(dir, file);
      stat(file, (_, stat) => {
        if (stat && stat.isDirectory()) {
          walk(
            file,
            (_, res) => {
              if (res) {
                results = results.concat(res);
              }
              if (!--pending) {
                done(null, results);
              }
            },
            filter
          );
        } else {
          if (typeof filter === "undefined" || (filter && filter(file))) {
            results.push(file);
          }
          if (!--pending) {
            done(null, results);
          }
        }
      });
    });
  });
};

function getCommandFiles(dir) {
  const startPath = "../";
  return new Promise((resolve, reject) => {
    walk(
      dir,
      (e, d) => {
        if (e) return reject(e);
        const relativePath = path.resolve(__dirname, startPath);

        resolve(
          d.map(
            (path) =>
              startPath + path.slice(relativePath.length + 1, path.length)
          )
        );
      },
      (file) => /.js$/.test(file)
    );
  });
}

module.exports = commandsloader;
