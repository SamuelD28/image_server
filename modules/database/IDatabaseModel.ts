export default interface IDatabaseModel {
    Create: (values: {
        [key: string]: any;
    }) => void;
    Apply: (values: {
        [key: string]: any;
    }) => void;
    Update: (values: {
        [key: string]: any;
    }) => void;
}
