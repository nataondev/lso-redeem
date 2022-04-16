const puppeteer = require("puppeteer");
const readlineSync = require("readline-sync");
const fs = require("fs");
var colors = require("colors");
colors.enable();

console.log("\n" + colors.bgMagenta("Lost Saga Auto Redeem by Nataon\n"));
// read file code redeem
if (!fs.existsSync("code.txt")) {
  console.log(colors.brightYellow("Separate with ',' for multiple code"));
  const codeRedeem = readlineSync.question("[?] Input code reedem: ");
  console.log(colors.bgGreen("Creating file code.txt"));
  fs.writeFileSync("code.txt", codeRedeem.toUpperCase(), "utf8");
}
const codeRedeem = fs.readFileSync("code.txt", "utf8");
// check codeRedeem exist
if (codeRedeem) {
  // check file akun.txt exist
  if (!fs.existsSync("akun.txt")) {
    // not exist then create file akun.txt
    console.log(
      colors.bgRed("File akun.txt not found, Fill akun.txt then try again")
    );
    fs.writeFileSync("akun.txt", "username|password\n", "utf8");
    process.exit();
  } else {
    // read file akun.txt
    var akun = fs.readFileSync("akun.txt", "utf8");
    akun = akun.split("\n");
    // remove last element if empty
    if (akun[akun.length - 1] == "") {
      akun.pop();
    }
    // check split code redeem
    var codeRedeemSplit = codeRedeem.split(",");
    // remove last element if empty
    if (codeRedeemSplit[codeRedeemSplit.length - 1] == "") {
      codeRedeemSplit.pop();
    }
    // looping akun.txt line by line
    (async function loop() {
      console.log(colors.brightBlue("Total account: " + akun.length));
      console.log(
        colors.brightBlue("Total redeem code: " + codeRedeemSplit.length)
      );
      for (var i = 0; i < akun.length; i++) {
        // split username and password
        var akunSplit = akun[i].split("|");
        // run process redeem
        await main([akunSplit[0], akunSplit[1], i + 1]);
      }
      console.log("");
      console.log(colors.bgGreen("All proccess finished"));
    })();
  }
} else {
  console.log(colors.bgRed("Code redeem is empty"));
}

// run async function
async function main(data) {
  const username = data[0];
  const password = data[1];
  const num_akun = data[2];

  console.log(
    colors.bgYellow("\n[" + num_akun + "] Trying to login (" + username + ")")
  );
  // open browser
  const options = { waitUntil: "networkidle2" };
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  // go to url login
  await page.goto("https://lostsaga.gnjoy.id/member", options);
  // type username
  const usernameField = await page.$("input[name=uname]");
  await usernameField.type(username);
  await usernameField.dispose();
  // type password
  const passwordField = await page.$("input[name=password]");
  await passwordField.type(password);
  await passwordField.dispose();
  // click button login
  const btnLogin = await page.$("button.btn.btn-default.form-submitcustom");
  await btnLogin.click();
  await btnLogin.dispose();
  // wait for page login loaded
  await page.waitForNavigation();
  // check url login valid or not
  if (page.url() == "https://lostsaga.gnjoy.id/member/profile") {
    // if valid then go to redeem page
    console.log(colors.bgGreen("Login success"));
    console.log(
      colors.bgMagenta("Trying to redeem " + codeRedeemSplit.length + " code") +
        "\n"
    );
    // looping code redeem
    for (var i = 0; i < codeRedeemSplit.length; i++) {
      console.log(
        colors.brightYellow(
          "[" + (i + 1) + "] Redeem (" + codeRedeemSplit[i] + ")"
        )
      );
      // type code redeem
      await page.goto("https://lostsaga.gnjoy.id/member/redeem", options);
      // type code redeem
      const redeemField = await page.$("input[name=code]");
      await redeemField.type(codeRedeemSplit[i]);
      await redeemField.dispose();
      // click button redeem
      const btnRedeem = await page.$("button.btn.btn-default.form-submit");
      await btnRedeem.click();
      await btnRedeem.dispose();
      // check redeem success or not
      await page.waitForNavigation();
      const element = await page.$("div.alert.alert-danger");
      if (element) {
        const textFailed = await page.evaluate(
          (element) => element.textContent,
          element
        );
        console.log(colors.bgRed("Redeem failed : " + textFailed));
      } else {
        console.log(colors.bgGreen("Redeem success"));
      }
    }
  } else {
    // failed to login
    console.log(colors.bgRed("Login failed:"));
    const element = await page.$("div.alert.alert-danger");
    const textFailed = await page.evaluate(
      (element) => element.textContent,
      element
    );
    console.log(colors.brightRed(textFailed));
  }
  await browser.close();
}
