// local ab, ac, bc = b - a, c - a, c - b;
// local abd, acd, bcd = ab:Dot(ab), ac:Dot(ac), bc:Dot(bc);

// if (abd > acd and abd > bcd) then
//     c, a = a, c;
// elseif (acd > bcd and acd > abd) then
//     a, b = b, a;
// end

// ab, ac, bc = b - a, c - a, c - b;

// local right = ac:Cross(ab).unit;
// local up = bc:Cross(right).unit;
// local back = bc.unit;

// local height = math.abs(ab:Dot(up));

// local w1 = wedge:Clone();
// w1.Size = Vector3.new(0.1, height, math.abs(ab:Dot(back)));
// w1.CFrame = CFrame.fromMatrix((a + b)/2, right, up, back);
// w1.Parent = chunk;
// colorPart(w1.Position.y,w1)

// local w2 = wedge:Clone();
// w2.Size = Vector3.new(0.1, height, math.abs(ac:Dot(back)));
// w2.CFrame = CFrame.fromMatrix((a + c)/2, -right, up, -back);
// w2.Parent = chunk;
// colorPart(w2.Position.y,w2)

// return w1, w2;

export class Triangle {
    draw(a : Vector3, b : Vector3, c : Vector3, wedge : BasePart) {
        let ab = b.sub(a)
        let ac = c.sub(a)
        let bc = c.sub(b)

        let abd = ab.Dot(ab)
        let acd = ac.Dot(ac)
        let bcd = bc.Dot(bc)

        if(abd > acd && abd > bcd) {
            let temp = c;
            c = a;
            a = temp;
        } else if(acd > bcd && acd > abd) {
            let temp = a;
            a = b;
            b = temp;
        }

        ab = b.sub(a)
        ac = c.sub(a)
        bc = c.sub(b)

        const right = ac.Cross(ab).Unit
        const up = bc.Cross(right).Unit
        const back = bc.Unit

        const height = math.abs(ab.Dot(up))

        const w1 = wedge.Clone()
        w1.Size = new Vector3(0.1, height, math.abs(ab.Dot(back)))
        w1.CFrame = CFrame.fromMatrix(a.add(b).div(2), right, up, back)

        const w2 = wedge.Clone()
        w2.Size = new Vector3(0.1, height, math.abs(ac.Dot(back)))
        w2.CFrame = CFrame.fromMatrix(a.add(c).div(2), right.mul(-1), up, back.mul(-1))

        wedge.Destroy()

        return $tuple(w1, w2)
    }
}