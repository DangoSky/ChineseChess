// 中国象棋的记谱方法？ - kevin bear的回答 - 知乎
// https://www.zhihu.com/question/24517862/answer/28064955

// 棋盘大小 十行九纵
//
// 内部坐标 0...8
// 0
// ...
// 9
//
// 红
// 一 二 三 四 五 六 七 八 九
//
// 黑
// ９ ８ ７ ６ ５ ４ ３ ２ １

const redNumber = [0, '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const blackNumber = [0, '１', '２', '３', '４', '５', '６', '７', '８', '９'];

function getNotion(chess, fromChessX, fromChessY, toChessX, toChessY) {
    let move = '';
    const {name, group} = chess;
    const number = group === 'red' ? redNumber : blackNumber;

    // 起始纵线与结束纵线
    let fromCol, toCol
    if (group === 'red') {
        fromCol = number[1 + fromChessY];
        toCol = number[1 + toChessY];
    } else {
        fromCol = number[9 - fromChessY]
        toCol = number[9 - toChessY];
    }

    // 判断方向
    let direction = '';
    if (fromChessX === toChessX) {
        direction = '平';
    } else {
        direction = (group === 'red' ? 1 : 0) ^ (fromChessX < toChessX ? 1 : 0) === 0 ? '进' : '退';
    }

    // 检查同名棋子
    let sameNameChessInSameRow = [];
    for (let i = 0; i < 10; ++i) {
        if (mark[i][chess.y]) {
            const checking = mark[i][chess.y]
            if (checking.group === group && checking.name === name) {
                sameNameChessInSameRow.push(checking)
            }
        }
    }

    // 将同名棋子按记谱方法上的前后顺序排列
    if (group === 'red') {
        sameNameChessInSameRow.reverse();
    }

    // 若同纵无其他同名棋子
    if (sameNameChessInSameRow.length === 1) {
        move = `${name}${fromCol}${direction}`;
    } else { // 若同纵有同名棋子
        if (name !== '兵' && name !== '卒') { // 非兵卒的棋子最多有两个，用前后可以区分
            const sort = sameNameChessInSameRow.indexOf(chess) === 0 ? '前' : '后';
            move = `${sort}${name}${direction}`;
        } else {
            let sort = ''
            if (sameNameChessInSameRow.length === 2) { // 兵卒只有两个时，用前后予以区分
                sort = sameNameChessInSameRow.indexOf(chess) === 0 ? '前' : '后';
            } else { // 兵卒多于两个时，用前二三四五予以区分
                const index = sameNameChessInSameRow.indexOf(chess);
                if (index === 0) {
                    sort = '前'
                } else {
                    sort = number[1 + index]
                }
            }
            move = `${sort}${fromCol}${direction}`
        }
    }

    // 起始纵线与终止纵线相同，则记谱采用步数
    if (fromCol === toCol) {
        const step = number[Math.abs(fromChessX - toChessX)]
        move += step
    } else { // 起始纵线与终止纵线不同，则记谱采用终止纵线
        move += toCol
    }

    return move
}
