import crypto from "crypto";

export function verifyBoreq(message: string, publicKey: string): boolean {
  const dataEndPost = 181;
  const messageBuffer = Buffer.from(decodeURIComponent(message), "base64");
  const data = messageBuffer.slice(0, dataEndPost).toString();
  const signatureBuffer = messageBuffer.slice(dataEndPost);

  const verify = crypto.createVerify("SHA1");
  verify.update(data);
  verify.end();

  return verify.verify(publicKey, signatureBuffer);
}
