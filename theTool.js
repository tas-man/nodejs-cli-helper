const readline = require('readline');
const events = require('events');
const chalk = require('chalk');

class _events extends events {}
let eventEmitter = new _events();

let theTool = {};

const commands = ['help', 'base64enc', 'base64dec', 'q'];
const commandDescription = {
  help: 'Show this manual',
  base64enc: 'Base64 encode string passed as parameter. (Expects 1 parameter)',
  base64dec: 'Base64 decode string passed as parameter. (Expects 1 parameter)',
  q: 'Quit current theTool session'
};

// -----------------------------
// EVENT LISTENERS

eventEmitter.on('help', input => {
  theTool.response.help();
});

eventEmitter.on('q', input => {
  theTool.response.exit();
});

eventEmitter.on('base64enc', input => {
  theTool.response.base64enc(input);
});

eventEmitter.on('base64dec', input => {
  theTool.response.base64dec(input);
});

// -----------------------------
// RESPONSES

theTool.response = {};

theTool.response.help = () => {
  const helpMenuColor = 'yellowBright';
  theTool.addVertical();
  theTool.addHorizontal();
  theTool.centerText('LIST OF COMMANDS', helpMenuColor);
  theTool.addHorizontal();
  commands.map(cmd => {
    theTool.addVertical();
    console.log(
      chalk[helpMenuColor](`\t\t\t${cmd} - ${commandDescription[cmd]}`)
    );
  });
  theTool.addVertical();
};

theTool.response.base64enc = str => {
  const parameter = str.substr(10);
  console.log(chalk.magenta(Buffer.from(parameter).toString('base64')));
};

theTool.response.base64dec = str => {
  const parameter = str.substr(10);
  console.log(
    chalk.magenta(Buffer.from(parameter, 'base64').toString('ascii'))
  );
};

theTool.response.exit = () => {
  theTool.addVertical();
  console.log(chalk.red('TheTool session was terminated'));
  process.exit(0);
};

// -----------------------------------------------------------------------------
// GENERAL CLI OUTPUT FORMATTING

theTool.addVertical = lines => {
  lines = typeof lines == 'number' && lines > 0 ? lines : 1;
  for (i = 0; i < lines; i++) {
    console.log('');
  }
};

theTool.addHorizontal = () => {
  const width = process.stdout.columns;
  let line = '';
  for (i = 0; i < width; i++) {
    line += '-';
  }
  console.log(line);
};

theTool.centerText = (str, color) => {
  str = typeof str == 'string' && str.trim().length > 0 ? str.trim() : '';
  const width = process.stdout.columns;
  const leftPadding = Math.floor((width - str.length) / 2);
  let line = '';
  for (i = 0; i < leftPadding; i++) {
    line += ' ';
  }
  line += str;
  console.log(chalk[color](line));
};

// -----------------------------
// USER INPUT PARSING

theTool.parseInput = input => {
  let isKnownCommand = false;
  const str =
    typeof input == 'string' && input.trim().length > 0 ? input.trim() : false;
  // Ignore empty input line
  if (str) {
    commands.some(cmd => {
      if (str.toLowerCase().indexOf(cmd) > -1) {
        isKnownCommand = true;
        eventEmitter.emit(cmd, str);
        return true;
      }
    });
    if (!isKnownCommand) {
      console.log(chalk.red('Unrecognized command, please try again!'));
    }
  }
};

// -----------------------------
// INITIALIZATION

theTool.init = () => {
  console.log(chalk.green('TheTool is running..'));
  let _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'TheTool>>'
  });
  _interface.prompt();

  // Process line input
  _interface.on('line', input => {
    theTool.parseInput(input);
    // Reset prompt
    setTimeout(() => {
      _interface.prompt();
    }, 50);
  });

  // Kill process gracefully on ctrl + c
  _interface.on('SIGINT', input => {
    theTool.response.exit();
    process.exit(0);
  });
};

theTool.init();
