function handle(payload) {
    const a = payload.operands.pop();
    const b = payload.operands.pop();
    return a + b;
}

module.exports = handle;