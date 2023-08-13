const { testServer } = require('../../../config.json');
const areCommandsDifferent = require('../../utils/areCommandsDifferent');
const getApplicationCommands = require('../../utils/getApplicationCommands');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = async (client) => {
  try {
    const localCommands = getLocalCommands();
    const applicationCommands = await getApplicationCommands(
      client,
      testServer
    );

    for (const localCommand of localCommands) {
      const { name, description, options } = localCommand;

      const existingCommand = await applicationCommands.cache.find(
        (cmd) => cmd.name === name
      );

      if (existingCommand) {
        if (localCommand.deleted) {
          await applicationCommands.delete(existingCommand.id);
          console.log(`"${name}" は削除されたコマンドです`);
          continue;
        }

        if (areCommandsDifferent(existingCommand, localCommand)) {
          await applicationCommands.edit(existingCommand.id, {
            description,
            options,
          });

          console.log(`"${name}" は編集されたコマンドです`);
        }
      } else {
        if (localCommand.deleted) {
          console.log(
            `"${name}" は削除するように設定されているため、登録をスキップします`
          );
          continue;
        }

        await applicationCommands.create({
          name,
          description,
          options,
        });

        console.log(`"${name}" が登録されました`);
      }
    }
  } catch (error) {
    console.log(`エラーが発生しました: ${error}`);
  }
};
