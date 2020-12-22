use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Request, RequestInit, Response};

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub async fn run() -> Result<JsValue, JsValue> {
    let url = "http://localhost:8000";
    let window = web_sys::window().unwrap();

    let mut opts = RequestInit::new();
    opts.method("GET");
    let request = Request::new_with_str_and_init(&url, &opts)?;
    let resp_value = JsFuture::from(window.fetch_with_request(&request)).await?;
    assert!(resp_value.is_instance_of::<Response>());
    let resp: Response = resp_value.dyn_into().unwrap();
    let request = JsFuture::from(resp.text()?).await?.as_string().unwrap();

    log(&format!("{}", request));

    let mut opts = RequestInit::new();
    opts.method("POST");
    opts.body(Some(&JsValue::from_str("HTTP/1.1 200 OK\r\nContent-Length: 12\r\n\r\nhello world\r\n")));
    let request = Request::new_with_str_and_init(&url, &opts)?;
    JsFuture::from(window.fetch_with_request(&request)).await?;

    Ok(JsValue::UNDEFINED)
}
