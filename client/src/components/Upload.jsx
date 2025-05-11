import React from 'react'
import { assets } from '../assets/assets'

const Upload = () => {
  return (
    <div className="pb-16">
        {/* Title */}
        <h1 className="text-center text-2xl md:text-3xl lg:text-4xl mt-4 font-bold py-6 md:py-16">
          See the <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">magic</span>. Try it now!
        </h1>

        <div className="text-center mb-24">
            <input type="file" name="" id="upload2" hidden />
            <label
              className="inline-flex items-center gap-4 px-8 py-3.5 rounded-full cursor-pointer bg-gradient-to-r from-violet-600 to-fuchsia-500 m-auto hover:scale-105 transition-all duration-700"
              htmlFor="upload2"
            >
                <img width={20} src={assets.upload_btn_icon} alt="" />
                <p className="font-bold font-sans text-white">Upload your image</p>
            </label>
        </div>
    </div>
  )
}

export default Upload
