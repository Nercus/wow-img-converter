use image::imageops::FilterType;
use image::ImageReader;
use rayon::spawn;
use tauri::{AppHandle, Emitter};

use wow_blp::{
    convert::{blp_to_image, image_to_blp, Blp2Format, BlpTarget, DxtAlgorithm},
    encode::save_blp,
    parser::load_blp,
};

pub fn convert_from_blp(input: &str, output: &str) -> Result<(), Box<dyn std::error::Error>> {
    let blp_file = load_blp(input)?;
    let image = blp_to_image(&blp_file, 0)?; // mipmap level 0
    image.save(output)?;
    Ok(())
}

pub fn convert_to_blp(input: &str, output: &str) -> Result<(), Box<dyn std::error::Error>> {
    let image = image::open(input)?;
    let blp = image_to_blp(
        image,
        false,
        BlpTarget::Blp2(Blp2Format::Dxt1 {
            has_alpha: true,
            compress_algorithm: DxtAlgorithm::ClusterFit,
        }),
        FilterType::Lanczos3,
    )?;
    save_blp(&blp, output)?;
    Ok(())
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
        let result = match (source_format.as_str(), target_format.as_str()) {
            ("blp", _) => convert_from_blp(&source_path, &target_path),
            (_, "blp") => convert_to_blp(&source_path, &target_path),
            _ => convert_others(&source_path, &target_path),
        };

        let is_ok = result.is_ok();

        if let Err(e) = &result {
            eprintln!("Error converting {} to {}: {}", source_path, target_path, e);
        }

        let payload = if is_ok {
            format!("completed:{}:{}", source_path, target_path)
        } else {
            format!("error:{}:{}", source_path, target_path)
        };

        // Emit event to frontend
        app.emit("conversion-status", payload).unwrap();
    });
}
