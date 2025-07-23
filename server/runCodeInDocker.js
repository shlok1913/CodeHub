const fs = require("fs");
const { spawn } = require("child_process");
const path = require("path");
const { v4: uuid } = require("uuid");


function runCodeInDocker(code, language, input = "") {
  return new Promise((resolve) => {
    console.log(language + "fuck you kirti");
    const id = uuid();
    const tempDir = path.join(__dirname, "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    let fileName, image, dockerCmd;
    if (language === "cpp") {
      fileName = `${id}.cpp`;
      image = "gcc:latest";
      dockerCmd = `echo "${input}" | g++ /code/${fileName} -o /code/${id} && echo "${input}" | /code/${id}`;
    } else if (language === "javascript") {
      fileName = `${id}.js`;
      image = "node:18";
      dockerCmd = `echo "${input}" | node /code/${fileName}`;
    } else {
      return resolve("❌ Unsupported language selected.");
    }

    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, code);

    // convert to POSIX path for Docker volume mount
    let posixPath = filePath.replace(/\\/g, "/");
    if (posixPath[1] === ":") {
      posixPath = `/${posixPath[0].toLowerCase()}${posixPath.slice(2)}`;
    }
    const volumeMount = path.posix.join(path.dirname(posixPath));

    const args = [
      "run",
      "--rm",
      "--memory=100m",
      "--cpus=0.5",
      "-v",
      `${volumeMount}:/code`,
      image,
      "sh",
      "-c",
      dockerCmd,
    ];

    const docker = spawn("docker", args);

    // ⬇️ Feed input to container
    if (input && input.trim()) {
      docker.stdin.write(input + "\n", "utf-8");
    }
    docker.stdin.end(); // Always close stdin

    let stdout = "";
    let stderr = "";

    docker.stdout.on("data", (data) => (stdout += data.toString()));
    docker.stderr.on("data", (data) => (stderr += data.toString()));

    docker.on("close", (code, signal) => {
      fs.unlink(filePath, () => {}); // clean up

      if (signal === "SIGKILL" || code === 137) {
        return resolve(`${stdout}\n❌ Killed: Memory or CPU limit exceeded`);
      }

      if (code !== 0) {
        return resolve(`${stdout}\n❌ Error: ${stderr || `Exit code ${code}`}`);
      }

      return resolve(stdout || "✅ No Output");
    });
  });
}

module.exports = runCodeInDocker;
