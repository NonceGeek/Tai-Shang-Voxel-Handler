## Usage(script.py在文章最后)
### 0. `python3 script.py -h`
**输入：（都在script.py同目录，懒得弄相对路径了。。）**
- inputpng的路径（即从MagicaVoxel导出的png，**可以省略**
- outputpng的路径（**不可省略**
- outputmtl的路径（**不可省略**
- type（**可以省略，默认random**
- replace（可以没有，有的话就是**`-r fromcolor tocolor`**，即将颜色从前者修改为后者
```bash
Usage: python3 script.py -i <inputpng> -o <outputpng> -m <outputmtl> -t <type>(default random) -r <fromcolor> <tocolor>(hex start with 0x) -s(show inputpng)
Example1: python3 script.py -i monu1.vox.png -o monu1.vox.png -m monu1.vox.mtl -t random
Example2: python3 script.py -i monu1.vox.png -o monu1.vox.png -m monu1.vox.mtl -r 0x839aa9 0xff0000
type: random, deeper, shallower
```

### 1. 随机生成palette png (256x1)
Example: `python3 script.py -i monu1.vox.png -o monu1.vox.png -m monu1.vox.mtl -t random`

### 2. 根据导出的palette png进行分析并修改
Example: `python3 script.py -i monu1.vox.png -o monu1.vox.png -m monu1.vox.mtl -t random`
根据之前的palette png文件让obj的颜色变得**更深/浅，每次变化的gap可修改script.py中Line6/7**

### 3. 查看输入png中的颜色
Example: `python3 script.py -i monu1.vox.png -s`

![image](https://user-images.githubusercontent.com/61953384/163141512-b7bcc747-c3a1-4ed6-a6ca-37c1c1821f3e.png)

### 4. 将之前png中的颜色修改为自己想要的颜色
Example: `python3 script.py -i monu1.vox.png -o monu1.vox.png -m monu1.vox.mtl -r 0x839aa9 0xff0000`
如将上图中的`0x839aa9`修改至`0xff0000`（红色）

**before:**

![image](https://user-images.githubusercontent.com/61953384/163142246-1cb9c5fc-2781-43b6-bb1b-697405556ba0.png)

**after `python3 script.py -i monu1.vox.png -o monu1.vox.png -m monu1.vox.mtl -r 0x893aa9 0xff0000`:**

![image](https://user-images.githubusercontent.com/61953384/163142334-8546abf0-dad8-4020-abd2-19564bb42789.png)


### 5. 打开obj即可查看修改后的效果
**before:**

![image](https://user-images.githubusercontent.com/61953384/163095677-9c3445cb-b995-4ff4-ae14-a1a324c14989.png)

**after `python3 script.py -i monu1.vox.png -o monu1.vox.png -m monu1.vox.mtl -t random`:**

![image](https://user-images.githubusercontent.com/61953384/163095783-874e57c3-a78a-4268-911e-2879edae89a3.png)

### 6. 将修改后的png应用到voxel中
**将上面生成的palette png导入到MagicaVoxel中，如下图所示：**

![image](https://user-images.githubusercontent.com/61953384/163095918-b6618785-9d6b-4949-b28d-18eae98ff3ad.png)

![image](https://user-images.githubusercontent.com/61953384/163096011-49ebf37d-100a-4e0d-b1ec-c09df923e54b.png)

![image](https://user-images.githubusercontent.com/61953384/163096029-5e55ac7a-9722-45a3-941b-3d2b70ae5d20.png)

```Python3
from PIL import Image
import random, sys, getopt, os

from hamcrest import none

DEEP = 20
SHALLOW = 20
SHOW_INPUTPNG = False

def writeMtl(opng, omtl):
    with open(omtl, "w") as w:
        w.write('''newmtl palette
illum 1
Ka 0.000 0.000 0.000
Kd 1.000 1.000 1.000
Ks 0.000 0.000 0.000
map_Kd {}\n'''.format(opng))

def loadPng(ipng):
    if ipng is None:
        rgbas = []
        for x in range(256):
            rgbas.append((255, 255, 255, 255))
        return rgbas
    if not os.path.isfile(ipng):
        print("{} not found".format(ipng))
        sys.exit(1)
    image = Image.open(ipng)
    pixels = image.load()
    rgbas = []
    for x in range(image.size[0]):
        rgbas.append(pixels[x, 0])
    return rgbas

def generatePng(ipng, opng, omtl, type_, replace):
    irgbas = loadPng(ipng)
    oimg = Image.new('RGBA', (256, 1), (0, 0, 0, 0))

    if replace is not None:
        frgba = str2rgba(replace[0])
        trgba = str2rgba(replace[1])
        for i in range(oimg.size[0]):
            rgba = tuple(irgbas[i])
            if rgba[0] == frgba[0] and rgba[1] == frgba[1] and rgba[2] == frgba[2]:
                oimg.putpixel((i, 0), (trgba[0], trgba[1], trgba[2], rgba[3]))
            else:
                oimg.putpixel((i, 0), rgba)
    else:
        if type_ == "random":
            for i in range(oimg.size[0]):
                oimg.putpixel((i, 0), (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255), 255))
        elif type_ == "deeper":
            for i in range(oimg.size[0]):
                rgba = tuple(max(0, x - DEEP) for x in irgbas[i])
                oimg.putpixel((i, 0), rgba)
        elif type_ == "shallower":
            for i in range(oimg.size[0]):
                rgba = tuple(min(255, x + SHALLOW) for x in irgbas[i])
                oimg.putpixel((i, 0), rgba)
        else:
            usage()
            sys.exit(1)

    oimg.save(opng)
    writeMtl(opng, omtl)

def usage():
    print("Usage: python3 script.py -i <inputpng> -o <outputpng> -m <outputmtl> -t <type>(default random) -r <fromcolor> <tocolor>(hex start with 0x) -s(show inputpng)")
    print("Example1: python3 script.py -i monu1.vox.png -o monu1.vox.png -m monu1.vox.mtl -t random")
    print("Example2: python3 script.py -i monu1.vox.png -o monu1.vox.png -m monu1.vox.mtl -r 0x839aa9 0xff0000")
    print("type: random, deeper, shallower")

def str2rgba(s):
    if s[0:2] != "0x":
        return None
    s = s[2:]
    if len(s) != 6:
        return None
    try:
        r = int(s[0:2], 16)
        g = int(s[2:4], 16)
        b = int(s[4:6], 16)
    except ValueError:
        return None
    return (r, g, b, 255)

def rgba2str(rgba):
    return "0x{:02x}{:02x}{:02x}".format(rgba[0], rgba[1], rgba[2])

if __name__ == "__main__":
    try:
        opts, args = getopt.getopt(sys.argv[1:],"hi:o:m:t:rs",["ipng=","opng=","omtl=","type=","replace=","showpng="])
    except getopt.GetoptError:
        print(getopt.GetoptError)
        usage()
        sys.exit(2)
    ipng, opng, omtl, type_, replace = None, None, None, None, None
    for opt, arg in opts:
        if opt == "-h":
            usage()
            sys.exit()
        elif opt in ("-s", "--showpng"):
            SHOW_INPUTPNG = True
        elif opt in ("-i", "--ipng"):
            ipng = arg
        elif opt in ("-o", "--opng"):
            opng = arg
        elif opt in ("-t", "--type"):
            type_ = arg
        elif opt in ("-m", "--omtl"):
            omtl = arg
        elif opt in ("-r", "--replace"):
            replace = args
    if SHOW_INPUTPNG: # show input png
        rgbas, lcnt = loadPng(ipng), 8
        for i, rgba in enumerate(rgbas):
            print(rgba2str(rgba), end=" ")
            if i % lcnt == lcnt - 1:
                print("")
        sys.exit(0)
    if opng is None or omtl is None:
        print("[ERROR] Please specify outputpng and outputmtl")
        usage()
        sys.exit()
    if replace is not None and len(replace) != 2:
        print("[ERROR] Please specify replace")
        usage()
        sys.exit()
    if replace is not None and (str2rgba(replace[0]) is None or str2rgba(replace[1]) is None):
        print("[ERROR] Please specify replace with hex")
        usage()
        sys.exit()

    if type_ is None: type_ = "random"
    generatePng(ipng, opng, omtl, type_, replace)

```