const fs = require("fs");
const { spawn } = require("child_process");
const path = require("path");
const { v4: uuid } = require("uuid");



// function runCodeInDocker(code) {
//   return new Promise((resolve) => {
//     const id = uuid();
//     const tempDir = path.join(__dirname, "temp");

//     if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
//     const filePath = path.join(tempDir, `${id}.js`);
//     fs.writeFileSync(filePath, code);

//     // Convert path for Docker
//     let posixPath = filePath.replace(/\\/g, "/");
//     if (posixPath[1] === ":") {
//       posixPath = `/${posixPath[0].toLowerCase()}${posixPath.slice(2)}`;
//     }

//     const dockerArgs = [
//       "run",
//       "--rm",
//       "--net=none",
//       "--memory=100m",
//       "--cpus=0.5",
//       "-v",
//       `${posixPath}:/code/script.js`,
//       "node:18",
//       "node",
//       "/code/script.js",
//     ];

//     const docker = spawn("docker", dockerArgs);
//     let stdout = "";
//     let stderr = "";

//     docker.stdout.on("data", (data) => {
//       stdout += data.toString();
//     });

//     docker.stderr.on("data", (data) => {
//       stderr += data.toString();
//     });

//     docker.on("close", (code, signal) => {
//       fs.unlink(filePath, () => {});
//       console.log(`🔚 Docker closed: code=${code}, signal=${signal}`);
//       console.log("📤 STDOUT:", stdout);
//       console.log("❌ STDERR:", stderr);

//       if (signal === "SIGKILL" || code === 137) {
//         return resolve(
//           `${stdout}\n❌ Error: Process killed (likely due to memory or CPU limit)`
//         );
//       }

//       if (code !== 0) {
//         return resolve(
//           `${stdout}\n❌ Error: ${stderr || `Exited with code ${code}`}`
//         );
//       }

//       return resolve(stdout || "✅ (No output)");
//     });


//   });
// }



// function runCodeInDocker(code, language = "javascript") {
//   return new Promise((resolve) => {
//     const id = uuid();
//     const tempDir = path.join(__dirname, "temp");
//     if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

//     let fileName, image, dockerCmd;
//     if (language === "cpp") {
//       fileName = `${id}.cpp`;
//       image = "gcc:latest";
//       dockerCmd = `g++ /code/${fileName} -o /code/${id} && /code/${id}`;
//     } else {
//       fileName = `${id}.js`;
//       image = "node:18";
//       dockerCmd = `node /code/${fileName}`;
//     }

//     const filePath = path.join(tempDir, fileName);
//     fs.writeFileSync(filePath, code);

//     // convert to POSIX path
//     let posixPath = filePath.replace(/\\/g, "/");
//     if (posixPath[1] === ":") {
//       posixPath = `/${posixPath[0].toLowerCase()}${posixPath.slice(2)}`;
//     }

//     const volumeMount = path.posix.join(path.dirname(posixPath));

//     const args = [
//       "run",
//       "--rm",
//       "--memory=100m",
//       "--cpus=0.5",
//       "-v",
//       `${volumeMount}:/code`,
//       image,
//       "sh",
//       "-c",
//       dockerCmd,
//     ];

//     const docker = spawn("docker", args);
//     let stdout = "";
//     let stderr = "";

//     docker.stdout.on("data", (data) => (stdout += data.toString()));
//     docker.stderr.on("data", (data) => (stderr += data.toString()));

//     docker.on("close", (code, signal) => {
//       fs.unlink(filePath, () => {});

//       if (signal === "SIGKILL" || code === 137) {
//         return resolve(`${stdout}\n❌ Killed: Memory or CPU limit exceeded`);
//       }

//       if (code !== 0) {
//         return resolve(`${stdout}\n❌ Error: ${stderr || `Exit code ${code}`}`);
//       }

//       return resolve(stdout || "✅ No Output");
//     });
//   });
// }



function runCodeInDocker(code, language , input = "") {
  return new Promise((resolve) => {
    const id = uuid();
    const tempDir = path.join(__dirname, "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

   let fileName, image, dockerCmd;

   switch (language) {
     case "cpp":
       fileName = `${id}.cpp`;
       image = "gcc:latest";
       dockerCmd = `echo "${input}" | g++ /code/${fileName} -o /code/${id} && echo "${input}" | /code/${id}`;
       break;

     case "c":
       fileName = `${id}.c`;
       image = "gcc:latest";
       dockerCmd = `echo "${input}" | gcc /code/${fileName} -o /code/${id} && echo "${input}" | /code/${id}`;
       break;

     case "javascript":
       fileName = `${id}.js`;
       image = "node:18";
       dockerCmd = `echo "${input}" | node /code/${fileName}`;
       break;

     case "python":
       fileName = `${id}.py`;
       image = "python:3.10";
       dockerCmd = `echo "${input}" | python3 /code/${fileName}`;
       break;

     case "java":
       const rawId = uuid();
       const className = "Main" + rawId.replace(/-/g, "");
       fileName = `${className}.java`;
       image = "openjdk:17";
       code = code.replace(/public\s+class\s+\w+/, `public class ${className}`);
       dockerCmd = `javac /code/${fileName} && echo "${input}" | java -cp /code ${className}`;
       break;

     case "go":
       fileName = `${id}.go`;
       image = "golang:1.21";
       dockerCmd = `echo "${input}" | go run /code/${fileName}`;
       break;

     case "ruby":
       fileName = `${id}.rb`;
       image = "ruby:3.2";
       dockerCmd = `echo "${input}" | ruby /code/${fileName}`;
       break;

     default:
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
