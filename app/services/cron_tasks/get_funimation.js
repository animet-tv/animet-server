const URLS = {
    allTitleUS: `https://search.prd.funimationsvc.com/v1/search?index=catalog-shows&region=US&limit=1000`
}

let fetchAllTitles = async (callback) => {
    try {
        let url =  URLS.allTitleUS;
    } catch (error) {
        console.log(error, `\n Faild while fetching all titles from Funimation \n ${allTitleUS}`);
    }
}
modules.exports = {

}