export const getWidth = async () =>
  (Deno.build.os === "linux")
    ? Number(new TextDecoder().decode(
      await Deno.run({
        cmd: ["tput", "cols"],
        stdout: "piped",
        stderr: "piped",
      }).output(),
    ))
    : 80;
