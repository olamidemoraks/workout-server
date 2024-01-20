import mongoose, { Document, Schema, Model } from "mongoose";

interface ICategory extends Document {
  image: {
    public_id: string;
    url: string;
  };
  title: string;
  feature: boolean;
}

const categorySchema = new Schema<ICategory>({
  image: {
    public_id: String,
    url: String,
  },
  title: {
    type: String,
    unique: true,
    required: true,
  },
  feature: { type: Boolean, default: false },
});

const Category: Model<ICategory> = mongoose.model("Category", categorySchema);
export default Category;
