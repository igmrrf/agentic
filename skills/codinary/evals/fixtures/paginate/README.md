# Pagination fixture — scenario 1

Use Node.js 18 or newer. No installation or external dependency is needed.

```sh
npm test
```

The public `paginate(items, limit = 10, offset = 0)` export starts as a stub.
The 13 initial tests fail until it is implemented. The fixture exercises the
prompt's integer limits and offsets, the maximum page size, empty and tail
pages, default arguments, and caller ownership of the input array and elements.
Noninteger numeric arguments and nonarray input are unspecified by this scenario.
