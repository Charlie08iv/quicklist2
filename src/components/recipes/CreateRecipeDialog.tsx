
import React, { useState, useRef } from "react";
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, FileImage } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface CreateRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRecipe: (recipe: any) => void;
}

interface Ingredient {
  id: string;
  name: string;
}

interface Instruction {
  id: string;
  text: string;
}

const DEFAULT_RECIPE_IMAGES = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
];

const CreateRecipeDialog: React.FC<CreateRecipeDialogProps> = ({
  open,
  onOpenChange,
  onCreateRecipe,
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(15);
  const [category, setCategory] = useState("other");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [instructions, setInstructions] = useState<string>("");
  const [newIngredient, setNewIngredient] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Choose a random default image if no image is uploaded
    let finalImage = uploadedImage;
    if (!finalImage) {
      const randomIndex = Math.floor(Math.random() * DEFAULT_RECIPE_IMAGES.length);
      finalImage = DEFAULT_RECIPE_IMAGES[randomIndex];
    }
    
    const newRecipe = {
      id: Date.now().toString(),
      title,
      description,
      prepTime,
      cookTime,
      liked: false,
      image: finalImage,
      category,
      ingredients: ingredients.map(ing => ({
        id: ing.id,
        name: ing.name,
        quantity: "1",
        unit: ""
      })),
      instructions: instructions,
      isPersonal: !isPublic,
    };

    onCreateRecipe(newRecipe);
    onOpenChange(false);
    
    // Reset form
    setTitle("");
    setDescription("");
    setPrepTime(15);
    setCookTime(15);
    setCategory("other");
    setIngredients([]);
    setInstructions("");
    setNewIngredient("");
    setIsPublic(false);
    setUploadedImage(null);
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, { id: Date.now().toString(), name: newIngredient }]);
      setNewIngredient("");
    }
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t("addNewRecipe")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-medium">{t("title")}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("enterRecipeTitle")}
              className="border-input focus-visible:ring-1"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">{t("description")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("enterDescription")}
              className="min-h-[100px] border-input focus-visible:ring-1"
              required
            />
          </div>
          
          <div className="space-y-3">
            <Label className="font-medium">{t("ingredients")}</Label>
            <div className="space-y-2">
              {ingredients.map((ing) => (
                <div key={ing.id} className="flex items-center gap-2">
                  <Input 
                    value={ing.name} 
                    className="flex-1"
                    readOnly
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveIngredient(ing.id)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder={t("addIngredient")}
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddIngredient} 
                className="shrink-0"
              >
                <Plus className="h-4 w-4 mr-1" />
                {t("add")}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instructions" className="font-medium">{t("instructions")}</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={t("enterInstructions")}
              className="min-h-[120px] border-input focus-visible:ring-1"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cookTime" className="font-medium">{t("cookingTime")}</Label>
            <Input
              id="cookTime"
              type="number"
              min="1"
              value={cookTime}
              onChange={(e) => setCookTime(Number(e.target.value))}
              className="border-input focus-visible:ring-1"
              placeholder="30 min"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category" className="font-medium">{t("category")}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full border-input focus:ring-1">
                <SelectValue placeholder={t("selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">{t("breakfast")}</SelectItem>
                <SelectItem value="lunch">{t("lunch")}</SelectItem>
                <SelectItem value="dinner">{t("dinner")}</SelectItem>
                <SelectItem value="vegetarian">{t("vegetarian")}</SelectItem>
                <SelectItem value="pasta">{t("pasta")}</SelectItem>
                <SelectItem value="dessert">{t("dessert")}</SelectItem>
                <SelectItem value="other">{t("other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image" className="font-medium">{t("recipeImage")}</Label>
            
            {uploadedImage && (
              <div className="mb-2">
                <img 
                  src={uploadedImage} 
                  alt="Recipe preview" 
                  className="max-h-32 rounded-md object-cover" 
                />
                <Button 
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadedImage(null)}
                  className="mt-2"
                >
                  {t("removeImage")}
                </Button>
              </div>
            )}
            
            <div className="flex flex-col space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2"
              >
                <FileImage className="h-4 w-4" />
                {t("uploadImage")}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="public" 
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(checked === true)}
            />
            <Label 
              htmlFor="public" 
              className="text-sm font-medium cursor-pointer"
            >
              {t("makeThisRecipePublic")}
            </Label>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="w-full sm:w-auto"
            >
              {t("cancel")}
            </Button>
            <Button 
              type="submit" 
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              {t("createRecipe")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRecipeDialog;
