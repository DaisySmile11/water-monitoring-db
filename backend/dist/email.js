"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const net_1 = __importDefault(require("net"));
const tls_1 = __importDefault(require("tls"));
function env(k) {
    return (process.env[k] || "").trim();
}
function b64(s) {
    return Buffer.from(s, "utf8").toString("base64");
}
function hasSmtpEnv() {
    return env("SMTP_HOST") && env("SMTP_PORT") && env("SMTP_USER") && env("SMTP_PASS") && env("SMTP_FROM");
}
async function readLine(sock, timeoutMs) {
    return new Promise((resolve, reject) => {
        let buf = "";
        const onData = (chunk) => {
            buf += chunk.toString("utf8");
            if (buf.includes("\n")) {
                cleanup();
                resolve(buf);
            }
        };
        const onErr = (e) => {
            cleanup();
            reject(e);
        };
        const t = setTimeout(() => {
            cleanup();
            reject(new Error("SMTP timeout"));
        }, timeoutMs);
        const cleanup = () => {
            clearTimeout(t);
            sock.off("data", onData);
            sock.off("error", onErr);
        };
        sock.on("data", onData);
        sock.on("error", onErr);
    });
}
async function write(sock, s) {
    return new Promise((resolve, reject) => {
        sock.write(s, (err) => (err ? reject(err) : resolve()));
    });
}
function extractCode(resp) {
    const m = resp.match(/^(\d{3})/m);
    return m ? Number(m[1]) : 0;
}
async function expect(sock, okCodes, timeoutMs = 10000) {
    const resp = await readLine(sock, timeoutMs);
    const code = extractCode(resp);
    if (!okCodes.includes(code)) {
        throw new Error(`SMTP unexpected response (${code}): ${resp}`);
    }
    return resp;
}
function makeMime({ from, to, subject, html }) {
    const boundary = "----wm" + Math.random().toString(16).slice(2);
    const headers = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        "MIME-Version: 1.0",
        `Content-Type: multipart/alternative; boundary=\"${boundary}\"`,
        ""
    ].join("\r\n");
    const body = [
        `--${boundary}`,
        "Content-Type: text/html; charset=utf-8",
        "Content-Transfer-Encoding: 7bit",
        "",
        html,
        `--${boundary}--`,
        ""
    ].join("\r\n");
    return headers + "\r\n" + body;
}
/**
 * Lightweight SMTP sender without external dependencies.
 * Supports:
 * - SMTPS (port 465) via TLS
 * - SMTP + STARTTLS (commonly 587) if SMTP_STARTTLS=true
 */
async function sendEmail(params) {
    if (!hasSmtpEnv()) {
        console.warn("⚠️ SMTP is not configured (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/SMTP_FROM). Skipping email send.");
        return false;
    }
    const host = env("SMTP_HOST");
    const port = Number(env("SMTP_PORT"));
    const user = env("SMTP_USER");
    const pass = env("SMTP_PASS");
    const from = env("SMTP_FROM");
    const useStartTls = env("SMTP_STARTTLS").toLowerCase() === "true";
    const recipients = params.to
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    if (recipients.length === 0)
        return false;
    // Connect
    let sock;
    if (port === 465) {
        sock = tls_1.default.connect({ host, port, servername: host, rejectUnauthorized: false });
        await new Promise((resolve, reject) => {
            sock.once("secureConnect", () => resolve());
            sock.once("error", reject);
        });
    }
    else {
        sock = net_1.default.connect({ host, port });
        await new Promise((resolve, reject) => {
            sock.once("connect", () => resolve());
            sock.once("error", reject);
        });
    }
    try {
        await expect(sock, [220]);
        await write(sock, `EHLO water-monitoring\r\n`);
        const ehlo = await readLine(sock, 10000);
        // STARTTLS upgrade (optional)
        if (port !== 465 && useStartTls && /STARTTLS/i.test(ehlo)) {
            await write(sock, `STARTTLS\r\n`);
            await expect(sock, [220]);
            sock = tls_1.default.connect({ socket: sock, servername: host, rejectUnauthorized: false });
            await new Promise((resolve, reject) => {
                sock.once("secureConnect", () => resolve());
                sock.once("error", reject);
            });
            await write(sock, `EHLO water-monitoring\r\n`);
            await readLine(sock, 10000);
        }
        // AUTH LOGIN
        await write(sock, `AUTH LOGIN\r\n`);
        await expect(sock, [334]);
        await write(sock, `${b64(user)}\r\n`);
        await expect(sock, [334]);
        await write(sock, `${b64(pass)}\r\n`);
        await expect(sock, [235]);
        await write(sock, `MAIL FROM:<${from}>\r\n`);
        await expect(sock, [250]);
        for (const r of recipients) {
            await write(sock, `RCPT TO:<${r}>\r\n`);
            await expect(sock, [250, 251]);
        }
        await write(sock, `DATA\r\n`);
        await expect(sock, [354]);
        const mime = makeMime({ from, to: recipients.join(", "), subject: params.subject, html: params.html });
        // End data with \r\n.\r\n
        await write(sock, mime + "\r\n.\r\n");
        await expect(sock, [250]);
        await write(sock, `QUIT\r\n`);
        return true;
    }
    catch (e) {
        console.error("SMTP send failed:", e);
        try {
            await write(sock, `QUIT\r\n`);
        }
        catch { }
        return false;
    }
    finally {
        try {
            sock.end();
        }
        catch { }
    }
}
