#![feature(universal_impl_trait)]
#![allow(non_camel_case_types)] // to get rid of the weird impl Iter warning
extern crate png;
extern crate regex;
use regex::Regex;

extern crate csv;
use csv::Writer;

#[macro_use] extern crate lazy_static;
#[macro_use] extern crate serde_derive;

use std::fs::{self, File};
use std::fmt;

const LENGTH_PER_PART: usize = 4050;
const CSV_NAME: &'static str = "sprites.csv";

lazy_static! {
    // two formats: sprites/<sprite_name>.png or sprites/<sprite_name>.png
    static ref SPRITE_DATA: Regex = Regex::new(r"sprites/(\w+)\.png").unwrap();
}

fn main() {
    let csv_file = File::create(CSV_NAME).expect("Unable to create file");
    let mut csv_wtr = Writer::from_writer(csv_file);
    
    for sprite_filename in read_directory_sorted("sprites") {
        // get the stuff that needs to be serielized into the csv file
        println!("Reading {}", sprite_filename);
        let parts = ImageDataPart::parts(&sprite_filename);
        for part in parts {
            csv_wtr.serialize(part).expect("Couldn't serialize");
        }
    }
}

fn read_directory_sorted(dir_name: &str) -> Vec<String> {
    // returns a sorted list of all of the files in the dircetory
    let iter = fs::read_dir(dir_name).expect("Couldn't read directory");
    let mut vec = iter
        .map(|entry| {
            let path = entry.unwrap().path();
            path.to_str().unwrap().to_owned()
        }).collect::<Vec<String>>();
        
    vec.sort();
    vec
}

#[derive(Debug, Serialize)]
struct ImageDataPart {
    name: String,
    data: String,
}

impl ImageDataPart {
    fn new(name: String, data: String) -> ImageDataPart {
        ImageDataPart { name, data }
    }
    
    fn parts(filename: &str) -> Vec<ImageDataPart> {
        // extract the sprite name from the filename
        let sprite_name = sprite_name_from_filename(filename);
        
        // figure out the data from the actual file
        let (rgba, width, height) = get_rgba(filename);
        let image_data = ImageData::new(width, height, rgba);
        
        // split up the imageData into multiple pices
        image_data
            .chunks(LENGTH_PER_PART).into_iter()
            .map(|chunk| ImageDataPart::new(sprite_name.clone(), chunk))
            .collect()
    }
}

struct ImageData {
    width: u32,
    height: u32,
    data: Vec<u8>,
}

impl ImageData {
    fn new(width: u32, height: u32, data: Vec<u8>) -> ImageData {
        ImageData { width, height, data }
    }
    
    fn chunks(&self, chunk_size: usize) -> Vec<String> {
        let string = format!("{}", self);
        (&string
            .chars()
            .collect::<Vec<char>>())
            .chunks(chunk_size)
            .map(|chunk| chunk.iter().collect::<String>())
            .collect()
    }
}

impl fmt::Display for ImageData {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        // outputs ImageData as JSON with no whitespace
        write!(f, "{{\"width\":{},\"height\":{},\"data\":{}}}", 
            &self.width.to_string(),
            &self.height.to_string(),
            &stringify(self.data.clone()),
        )
    }
}



fn stringify<T: fmt::Debug>(vec: Vec<T>) -> String {
    let mut string = String::from("[");
    for item in vec {
        string += &format!("{:?},", item);
    }
    string.pop(); // remove the last comma
    string += "]";
    string
}

fn sprite_name_from_filename(filename: &str) -> String {
    let captures = SPRITE_DATA.captures(filename).expect("Bad sprite name");
    
    captures[1].to_owned()
}


fn get_rgba(filename: &str) -> (Vec<u8>, u32, u32) {
    let decoder = png::Decoder::new(File::open(filename).unwrap());
    
    let (info, mut reader) = decoder.read_info().unwrap();
    let mut buf = vec![0; info.buffer_size()];
    reader.next_frame(&mut buf).unwrap();
    
    (buf, info.width, info.height)
}
