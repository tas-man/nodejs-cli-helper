const readline = require('readline');
const events = require('events');
const chalk = require('chalk');

class _events extends events {}
let eventEmitter = new _events();

let theTool = {};

const acceptedCommands = ['help', 'q', 'base64enc'];
const acceptedCommandDesc = {
  help: 'Show this manual',
  q: 'Quit current theTool session',
  base64enc: 'Base64 encode string passed as parameter. (Expects 1 parameter)'
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

// -----------------------------
// RESPONSES

theTool.response = {};

theTool.response.help = () => {
  const helpMenuColor = 'yellowBright';
  theTool.addVertical();
  theTool.addHorizontal();
  theTool.centerText('LIST OF COMMANDS', helpMenuColor);
  theTool.addHorizontal();
  acceptedCommands.map(cmd => {
    theTool.addVertical();
    console.log(
      chalk[helpMenuColor](`          ${cmd} - ${acceptedCommandDesc[cmd]}`)
    );
  });
};

theTool.response.exit = () => {
  theTool.addVertical();
};

theTool.response.base64enc = str => {
  const parameter = str.substr(10);
  console.log(chalk.magenta(Buffer.from(parameter).toString('base64')));
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
  // Get available screen width
  let width = process.stdout.columns;
  let line = '';
  for (i = 0; i < width; i++) {
    line += '-';
  }
  console.log(line);
};

theTool.centerText = (str, color) => {
  str = typeof str == 'string' && str.trim().length > 0 ? str.trim() : '';
  // Get current CLI screen width
  let width = process.stdout.columns;
  // Calculate left padding
  let leftPadding = Math.floor((width - str.length) / 2);
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
  let isCommandMatch = false;
  let str =
    typeof input == 'string' && input.trim().length > 0 ? input.trim() : false;
  // Ignore empty input line
  if (str) {
    acceptedCommands.some(cmd => {
      // Emit custom event on recognized command input
      if (str.toLowerCase().indexOf(cmd) > -1) {
        isCommandMatch = true;
        eventEmitter.emit(cmd, str);
        return true;
      }
    });
    if (!isCommandMatch) {
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
