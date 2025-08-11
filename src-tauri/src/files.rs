#[tauri::command]
pub fn get_allowed_files(paths: Vec<String>) -> Vec<String> {
    use std::fs;
    use std::path::Path;

    const ALLOWED_EXTENSIONS: [&str; 3] = [".blp", ".png", ".tga"];

    fn is_allowed(path: &str) -> bool {
        ALLOWED_EXTENSIONS
            .iter()
            .any(|ext| path.to_lowercase().ends_with(ext))
    }

    fn collect_files(path: &Path, files: &mut Vec<String>) {
        if let Ok(metadata) = fs::metadata(path) {
            if metadata.is_file() {
                if let Some(p) = path.to_str() {
                    if is_allowed(p) {
                        files.push(p.to_string());
                    }
                }
            } else if metadata.is_dir() {
                if let Ok(entries) = fs::read_dir(path) {
                    for entry in entries.flatten() {
                        collect_files(&entry.path(), files);
                    }
                }
            }
        }
    }

    let mut files = Vec::new();
    for path in paths {
        collect_files(Path::new(&path), &mut files);
    }
    files
}
