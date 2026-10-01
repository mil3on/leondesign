import bpy
from pathlib import Path

output = Path(r"C:\Users\Lenovo\OneDrive\Documents\ChatGPT\сайт портфолио\portfolio-head\public\models\official-leon.glb")
output.parent.mkdir(parents=True, exist_ok=True)

bpy.ops.object.select_all(action="DESELECT")

export_names = {"Armature", "Character", "Phone", "iPhone 5s / SE", "node_0"}
selected = []
for obj in bpy.context.scene.objects:
    if obj.name in export_names and not obj.hide_render:
        obj.hide_set(False)
        obj.select_set(True)
        selected.append(obj.name)

if not selected:
    raise RuntimeError("No visible Official Leon objects were found for export")

if "Armature" in bpy.data.objects:
    bpy.context.view_layer.objects.active = bpy.data.objects["Armature"]

# Keep the web model sharp enough for the footer while avoiding an 80–100 MB
# download. This changes only the in-memory copy opened in background mode.
for image in bpy.data.images:
    if image.size[0] > 2048 or image.size[1] > 2048:
        factor = min(2048 / image.size[0], 2048 / image.size[1])
        image.scale(max(1, round(image.size[0] * factor)), max(1, round(image.size[1] * factor)))

bpy.ops.export_scene.gltf(
    filepath=str(output),
    export_format="GLB",
    use_selection=True,
    export_animations=True,
    export_skins=True,
    export_morph=True,
    export_lights=False,
    export_cameras=False,
    export_apply=False,
    export_image_format="WEBP",
    export_image_quality=82,
)

print("EXPORTED", output, output.stat().st_size, "OBJECTS", selected)
