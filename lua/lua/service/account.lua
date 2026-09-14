---@class Account
---@field id string Unique account identifier
---@field balance_minor integer Current account balance in minor currency units
---@field is_active boolean Whether the account is active for transactions
local Account = {}
Account.__index = Account

---Creates a new validated Account instance.
---@param id string
---@param initial_balance integer
---@return Account|nil account The initialized account, or nil on failure
---@return string|nil error Error message if validation fails
function Account.new(id, initial_balance)
  if not id or id == "" then
    return nil, "account id cannot be empty"
  end
  if not initial_balance or initial_balance < 0 then
    return nil, "initial balance must be non-negative"
  end

  local self = setmetatable({}, Account)
  self.id = id
  self.balance_minor = initial_balance
  self.is_active = true
  return self, nil
end

---Debits an amount from the account.
---@param amount_minor integer
---@return boolean success
---@return string|nil error
function Account:debit(amount_minor)
  if not self.is_active then
    return false, "account is suspended"
  end
  if amount_minor <= 0 then
    return false, "debit amount must be positive"
  end
  if self.balance_minor < amount_minor then
    return false, "insufficient funds"
  end

  self.balance_minor = self.balance_minor - amount_minor
  return true, nil
end

return Account
