use image::imageops::FilterType;
use image::ImageReader;
use rayon::spawn;
use serde_json::json;
use tauri::{AppHandle, Emitter};

use wow_blp::{
    convert::{blp_to_image, image_to_blp, Blp2Format, BlpTarget, DxtAlgorithm},
    encode::save_blp,
    parser::load_blp,
};

pub fn convert_from_blp(input: &str, output: &str) -> Result<(), Box<dyn std::error::Error>> {
    let result = std::panic::catch_unwind(|| {
        let blp_file = load_blp(input)?;
        let image = blp_to_image(&blp_file, 0)?; // mipmap level 0
        image.save(output)?;
        Ok(())
    });

    match result {
        Ok(inner) => inner,
        Err(_) => Err("BLP conversion panicked".into()),
    }
}

pub fn convert_to_blp(
    input: &str,
    output: &str,
    is_compressed: bool,
) -> Result<(), Box<dyn std::error::Error>> {
    let result = std::panic::catch_unwind(|| {
        let image = image::open(input)?;
        let blp = if is_compressed {
            image_to_blp(
                image,
                true,
                BlpTarget::Blp2(Blp2Format::Dxt5 {
                    has_alpha: true,
                    compress_algorithm: DxtAlgorithm::RangeFit,
                }),
                FilterType::Lanczos3,
            )?
        } else {
            image_to_blp(
                image,
                false,
                BlpTarget::Blp2(Blp2Format::Raw3),
                FilterType::Lanczos3,
            )?
        };
        save_blp(&blp, output)?;
        Ok::<(), Box<dyn std::error::Error>>(())
    });

    match result {
        Ok(inner) => inner,
        Err(_) => Err("BLP encoding panicked".into()),
    }
}

pub fn convert_others(input: &str, output: &str) -> Result<(), Box<dyn std::error::Error>> {
    let source_image = ImageReader::open(input)?.decode()?;
    source_image.save(output)?;
    Ok(())
}

#[tauri::command]
pub fn convert(
    app: AppHandle,
    source_path: String,
    target_path: String,
    source_format: String,
    target_format: String,
) {
    spawn(move || {
        let source_format_lower = source_format.to_lowercase();
        let target_format_lower = target_format.to_lowercase();


        let result = match (source_format_lower.as_str(), target_format_lower.as_str()) {
            ("blp", _) => convert_from_blp(&source_path, &target_path),
            (_, "blp_dxt") => convert_to_blp(&source_path, &target_path, true),
            (_, "blp_raw") => convert_to_blp(&source_path, &target_path, false),
            _ => convert_others(&source_path, &target_path),
        };

        let is_ok = result.is_ok();

        if let Err(e) = &result {
            eprintln!("Error converting {} to {}: {}", source_path, target_path, e);
        }

        let payload = json!({
            "status": if is_ok { "completed" } else { "error" },
            "source": source_path,
            "target": target_path
        })
        .to_string();

        // Emit event to frontend
        app.emit("conversion-status", payload).unwrap();
    });
}
