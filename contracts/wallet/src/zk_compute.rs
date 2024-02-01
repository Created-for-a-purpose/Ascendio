use pbc_zk::*;
use create_type_spec_derive::CreateTypeSpec;

#[derive(Clone, SecretBinary, CreateTypeSpec)]
pub struct PassCode {
        password: Sbi128,
        code: Sbi32
}

#[derive(Clone, SecretBinary, CreateTypeSpec)]
pub struct Password {
        password: Sbi128
}
    
#[derive(Clone, SecretBinary, CreateTypeSpec)]
pub struct Code {
        code : Sbi32
}

#[allow(unused)]
#[derive(pbc_zk::SecretBinary, Clone, CreateTypeSpec)]
pub struct SecretResponse {
    status_code: Sbi8
}

#[zk_compute(shortname = 0x61)]
pub fn secret_process(secret_id: SecretVarId, pass_secret_id: SecretVarId, code_secret_id: SecretVarId)  -> SecretResponse {
    
        let input = load_sbi::<PassCode>(secret_id);
        let mut pass = load_sbi::<Password>(pass_secret_id);
        let code = load_sbi::<Code>(code_secret_id);
        let mut response = SecretResponse {
                status_code: Sbi8::from(0 as i8) // staus code 0 means failure
        };
        if input.code == code.code {
                pass.password = input.password;
                response.status_code = Sbi8::from(1 as i8) // status code 1 means success
        } 

        response
}

#[zk_compute(shortname = 0x62)]
pub fn secret_matcher(secret_id: SecretVarId, pass_secret_id: SecretVarId) -> SecretResponse {
        let input = load_sbi::<Password>(secret_id);
        let pass = load_sbi::<Password>(pass_secret_id);
        let mut response = SecretResponse {
                status_code: Sbi8::from(0 as i8) // status code 0 means failure
        };
        if input.password == pass.password {
                response.status_code = Sbi8::from(1 as i8) // status code 1 means success
        } 

        response
}